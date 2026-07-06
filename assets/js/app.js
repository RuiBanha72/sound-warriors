const STORAGE_KEY = "sound-warriors-state-v1";

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
    return { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderHud();
  renderRewards();
  renderProgress();
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
    <article class="world">
      <div>
        <div class="crystal">${pair.icon}</div>
        <h3>${pair.title}</h3>
        <p>${pair.description}</p>
      </div>
      <button class="primary" data-start-pair="${pair.id}">Entrar neste mundo</button>
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
  const custom = state.customErrors
    .filter(error => error.pair === pair.title.replace("Cristal ", "") || error.pair.toLowerCase().replace("/", "") === pair.id)
    .map(error => ({
      correct: error.correct,
      distractor: error.wrong,
      prompt: error.sentence || `Encontra a forma correta da palavra: ${error.correct}`
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

  qs("#missionBadge").textContent = pair.title;
  qs("#missionMode").textContent = randomMode();
  qs("#challengeTitle").textContent = "Qual é a palavra correta?";
  qs("#challengePrompt").textContent = word.prompt;
  qs("#feedback").textContent = "";
  qs("#feedback").className = "feedback";
  qs("#choices").innerHTML = choices.map(choice => `<button class="choice" data-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>`).join("");

  qsa("[data-choice]").forEach(button => {
    button.addEventListener("click", () => answer(button.dataset.choice));
  });
}

function randomMode() {
  const modes = ["Detetive dos Sons", "Batalha do Cristal", "Caça ao Monstro", "Ataque Relâmpago"];
  return modes[Math.floor(Math.random() * modes.length)];
}

function answer(choice) {
  if (!currentChallenge) return;

  const pairId = currentChallenge.pair.id;
  state.pairStats[pairId] = state.pairStats[pairId] || { correct: 0, wrong: 0 };

  if (choice === currentChallenge.answer) {
    state.streak += 1;
    state.completed += 1;
    state.xp += 12 + Math.min(state.streak, 10);
    state.coins += 8 + Math.floor(state.streak / 3);
    state.pairStats[pairId].correct += 1;

    qs("#feedback").textContent = `Acertaste! Combo x${state.streak}. Ganhaste XP e moedas.`;
    qs("#feedback").className = "feedback good";
  } else {
    state.streak = 0;
    state.pairStats[pairId].wrong += 1;
    qs("#feedback").textContent = `Quase! A resposta certa era “${currentChallenge.answer}”. Vamos repetir noutra missão.`;
    qs("#feedback").className = "feedback bad";
  }

  saveState();
  setTimeout(newMission, 1300);
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
        <small>${unlocked ? "Desbloqueada" : `Desbloqueia com ${reward.unlockAt} moedas`}</small>
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
  });

  qs("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.customErrors, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sound-warriors-erros.json";
    link.click();
    URL.revokeObjectURL(url);
  });
}

function renderCustomErrors() {
  const list = qs("#customErrors");
  if (!state.customErrors.length) {
    list.innerHTML = `<article class="error-item"><p>Ainda não existem erros registados. Adiciona o primeiro monstro no formulário acima.</p></article>`;
    return;
  }

  list.innerHTML = state.customErrors.map(error => `
    <article class="error-item">
      <p><strong>${escapeHtml(error.correct)}</strong> em vez de <strong>${escapeHtml(error.wrong)}</strong> · ${escapeHtml(error.pair)} · ${escapeHtml(error.difficulty)}</p>
      <p>${escapeHtml(error.sentence || "Sem frase registada.")}</p>
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
        <p>${s.correct} certas · ${s.wrong} a rever</p>
      </article>
    `;
  }).join("");

  stats.innerHTML = `
    <article class="stat"><h3>Missões concluídas</h3><div class="big">${state.completed}</div><p>Total de desafios ganhos.</p></article>
    <article class="stat"><h3>Maior combo atual</h3><div class="big">${state.streak}</div><p>Sequência atual de respostas certas.</p></article>
    <article class="stat"><h3>Erros personalizados</h3><div class="big">${state.customErrors.length}</div><p>Monstros criados no Laboratório.</p></article>
    ${pairCards}
  `;
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
qs("#newMissionBtn").addEventListener("click", newMission);
qs("#hintBtn").addEventListener("click", () => {
  const pair = currentChallenge?.pair || getPair();
  qs("#feedback").textContent = pair.hint;
  qs("#feedback").className = "feedback";
});

renderHud();
renderWorlds();
renderRewards();
renderCustomErrors();
renderProgress();
setupLab();
