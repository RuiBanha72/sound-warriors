const STORAGE_KEY = "sound-warriors-state-v2";

const defaultState = {
  playerName: "Simone",
  xp: 0,
  coins: 0,
  completed: 0,
  streak: 0,
  activePairId: "fv",
  customErrors: [],
  pairStats: {}
};

let state = loadState();
let currentChallenge = null;

function loadState() {
  try {
    const v2 = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (v2) return { ...defaultState, ...v2 };
    const v1 = JSON.parse(localStorage.getItem("sound-warriors-state-v1"));
    return { ...defaultState, ...(v1 || {}) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderHud();
  renderRewards();
  renderProgress();
  updateBattleExtras();
}

function levelFromXp(xp) {
  return Math.max(1, Math.floor(xp / 120) + 1);
}

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return [...document.querySelectorAll(selector)];
}

function renderHud() {
  qs("#playerName").textContent = state.playerName;
  qs("#xp").textContent = state.xp;
  qs("#coins").textContent = state.coins;
  qs("#level").textContent = levelFromXp(state.xp);
}

function switchScreen(name) {
  qsa(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.screen === name));
  qsa(".screen").forEach(screen => screen.classList.remove("active"));
  qs(`#screen-${name}`).classList.add("active");
}

function getPair(pairId = state.activePairId) {
  return window.SW_DATA.soundPairs.find(pair => pair.id === pairId) || window.SW_DATA.soundPairs[0];
}

function renderWorlds() {
  const worlds = qs("#worlds");
  worlds.innerHTML = window.SW_DATA.soundPairs.map(pair => `
    <article class="world" style="--world-glow:${pair.glow || "rgba(255,47,179,0.35)"}">
      <div>
        <div class="crystal">${pair.icon}</div>
        <p class="kicker">Portal ${pair.code || pair.id.toUpperCase()}</p>
        <h3>${pair.title}</h3>
        <p>${pair.description}</p>
      </div>
      <button class="primary" data-start-pair="${pair.id}">Entrar na arena</button>
    </article>
  `).join("");

  qsa("[data-start-pair]").forEach(button => {
    button.addEventListener("click", () => {
      state.activePairId = button.dataset.startPair;
      saveState();
      switchScreen("mission");
      newMission();
    });
  });
}

function allWordsForPair(pair) {
  const code = pair.code || pair.title.replace("Cristal ", "");
  const custom = state.customErrors
    .filter(error => error.pair === code || error.pair.toLowerCase().replace("/", "") === pair.id)
    .map(error => ({
      correct: error.correct,
      distractor: error.wrong,
      prompt: error.sentence ? `O glitch apareceu nesta cena: “${error.sentence}”` : `Neutraliza o glitch da palavra: ${error.correct}`,
      custom: true
    }));

  return [...pair.words, ...custom];
}

function newMission() {
  const pair = getPair();
  const words = allWordsForPair(pair);
  const word = words[Math.floor(Math.random() * words.length)];
  const choices = shuffle([word.correct, word.distractor]);

  currentChallenge = {
    pair,
    word,
    answer: word.correct
  };

  qs("#missionBadge").textContent = `${pair.title} · ${pair.code || ""}`;
  qs("#missionMode").textContent = randomMode();
  qs("#monsterName").textContent = pair.monster || "Glitch";
  qs("#challengeTitle").textContent = randomTitle();
  qs("#challengePrompt").textContent = word.prompt;
  qs("#feedback").textContent = "";
  qs("#feedback").className = "feedback";
  qs("#choices").innerHTML = choices.map(choice => `<button class="choice" data-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>`).join("");

  qsa("[data-choice]").forEach(button => {
    button.addEventListener("click", () => answer(button.dataset.choice));
  });

  updateBattleExtras();
}

function randomMode() {
  const modes = ["Pop Battle", "Glitch Rush", "Crystal Stage", "Super Refrão", "Neon Duel"];
  return modes[Math.floor(Math.random() * modes.length)];
}

function randomTitle() {
  const titles = ["Escolhe o ataque certo", "Derrota o glitch", "Qual desbloqueia o portal?", "Ativa a palavra final", "Salva o refrão"];
  return titles[Math.floor(Math.random() * titles.length)];
}

function answer(choice) {
  if (!currentChallenge) return;

  const pairId = currentChallenge.pair.id;
  state.pairStats[pairId] = state.pairStats[pairId] || { correct: 0, wrong: 0 };

  if (choice === currentChallenge.answer) {
    state.streak += 1;
    state.completed += 1;
    state.xp += 15 + Math.min(state.streak, 12);
    state.coins += 10 + Math.floor(state.streak / 3);
    state.pairStats[pairId].correct += 1;

    qs("#feedback").textContent = state.streak >= 5
      ? `SUPER REFRÃO! Combo x${state.streak}. O público está ao rubro!`
      : `Boom! Glitch derrotado. Combo x${state.streak}.`;
    qs("#feedback").className = "feedback good pop";
    burstConfetti(state.streak >= 5 ? 32 : 14);
  } else {
    state.streak = 0;
    state.pairStats[pairId].wrong += 1;
    qs("#feedback").textContent = `O glitch escapou por pouco. A palavra final era “${currentChallenge.answer}”.`;
    qs("#feedback").className = "feedback bad pop";
  }

  saveState();
  setTimeout(newMission, choice === currentChallenge.answer ? 1150 : 1650);
}

function renderRewards() {
  const grid = qs("#rewardGrid");
  grid.innerHTML = window.SW_DATA.rewards.map(reward => {
    const unlocked = state.coins >= reward.unlockAt;
    return `
      <article class="reward ${unlocked ? "" : "locked"}">
        <div class="icon">${reward.icon}</div>
        <div class="rarity">${reward.rarity}</div>
        <h3>${reward.name}</h3>
        <p>${reward.title}</p>
        <small>${unlocked ? "Na tua equipa" : `Bloqueada até ${reward.unlockAt} gemas`}</small>
      </article>
    `;
  }).join("");
}

function setupLab() {
  qs("#errorForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      correct: String(form.get("correct")).trim(),
      wrong: String(form.get("wrong")).trim(),
      pair: String(form.get("pair")).trim(),
      sentence: String(form.get("sentence")).trim(),
      difficulty: String(form.get("difficulty")).trim(),
      createdAt: new Date().toISOString()
    };

    if (!entry.correct || !entry.wrong) return;

    state.customErrors.unshift(entry);
    event.currentTarget.reset();
    saveState();
    renderCustomErrors();
    burstConfetti(18);
  });

  qs("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.customErrors, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sound-warriors-glitches.json";
    link.click();
    URL.revokeObjectURL(url);
  });
}

function renderCustomErrors() {
  const list = qs("#customErrors");
  if (!state.customErrors.length) {
    list.innerHTML = `<article class="error-item"><p>Ainda não há glitches personalizados. Quando encontrares um, guarda-o aqui e ele entra nas próximas batalhas.</p></article>`;
    return;
  }

  list.innerHTML = state.customErrors.map(error => `
    <article class="error-item">
      <p><strong>${escapeHtml(error.correct)}</strong> venceu <strong>${escapeHtml(error.wrong)}</strong> · Portal ${escapeHtml(error.pair)} · ${escapeHtml(error.difficulty)}</p>
      <p>${escapeHtml(error.sentence || "Sem cena registada.")}</p>
    </article>
  `).join("");
}

function renderProgress() {
  const stats = qs("#progressCards");
  const pairCards = window.SW_DATA.soundPairs.map(pair => {
    const s = state.pairStats[pair.id] || { correct: 0, wrong: 0 };
    const total = s.correct + s.wrong;
    const pct = total ? Math.round((s.correct / total) * 100) : 0;
    return `
      <article class="stat">
        <h3>${pair.title}</h3>
        <div class="big">${pct}%</div>
        <p>${s.correct} vitórias · ${s.wrong} glitches fugiram</p>
      </article>
    `;
  }).join("");

  stats.innerHTML = `
    <article class="stat"><h3>Batalhas ganhas</h3><div class="big">${state.completed}</div><p>Total de vitórias no palco.</p></article>
    <article class="stat"><h3>Combo atual</h3><div class="big">${state.streak}</div><p>Sequência viva de ataques certos.</p></article>
    <article class="stat"><h3>Glitches próprios</h3><div class="big">${state.customErrors.length}</div><p>Criados no Backstage.</p></article>
    ${pairCards}
  `;
}

function updateBattleExtras() {
  const combo = qs("#comboValue");
  if (combo) combo.textContent = `x${state.streak}`;

  const energy = qs("#battleEnergy");
  if (energy) {
    energy.textContent = state.streak >= 5 ? "Super Refrão ativo" : `${Math.max(0, 5 - state.streak)} até ao Super Refrão`;
  }

  const next = window.SW_DATA.rewards.find(reward => state.coins < reward.unlockAt);
  const nextEl = qs("#nextRewardAt");
  if (nextEl) nextEl.textContent = next ? next.unlockAt : "MAX";
}

function burstConfetti(amount = 18) {
  const colors = ["#ff2fb3", "#35d6ff", "#ffd86b", "#aaff5f", "#7b3dff"];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.22}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1400);
  }
}

function shuffle(items) {
  return items
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

qsa(".tab").forEach(tab => tab.addEventListener("click", () => switchScreen(tab.dataset.screen)));
qsa("[data-screen-jump]").forEach(button => button.addEventListener("click", () => {
  switchScreen(button.dataset.screenJump);
  if (button.dataset.screenJump === "mission") newMission();
}));

qs("#newMissionBtn").addEventListener("click", newMission);
qs("#hintBtn").addEventListener("click", () => {
  const pair = currentChallenge?.pair || getPair();
  qs("#feedback").textContent = pair.hint;
  qs("#feedback").className = "feedback pop";
});

renderHud();
renderWorlds();
renderRewards();
renderCustomErrors();
renderProgress();
updateBattleExtras();
setupLab();
