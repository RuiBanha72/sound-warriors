const STORAGE_KEY = "sound-warriors-state-v3";

const defaultState = {
  playerName: "Simone",
  xp: 0,
  coins: 0,
  completed: 0,
  streak: 0,
  activePairId: "fv",
  activeMode: "choose",
  customErrors: [],
  pairStats: {},
  modeStats: {},
  wordStats: {}
};

let state = loadState();
let currentChallenge = null;
let bossQueue = [];

function loadState() {
  try {
    const v3 = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (v3) return hydrateState(v3);

    const v2 = JSON.parse(localStorage.getItem("sound-warriors-state-v2"));
    if (v2) return hydrateState(v2);

    const v1 = JSON.parse(localStorage.getItem("sound-warriors-state-v1"));
    return hydrateState(v1 || {});
  } catch {
    return hydrateState({});
  }
}

function hydrateState(value) {
  return {
    ...defaultState,
    ...value,
    customErrors: Array.isArray(value.customErrors) ? value.customErrors : [],
    pairStats: value.pairStats || {},
    modeStats: value.modeStats || {},
    wordStats: value.wordStats || {}
  };
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

function audio() {
  return window.SW_AUDIO || { init() {}, setMode() {}, playSfx() {} };
}

function todayNumber() {
  return Math.floor(Date.now() / 86400000);
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
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
  audio().setMode(name === "mission" ? "battle" : "menu");
}

function getPair(pairId = state.activePairId) {
  return window.SW_DATA.soundPairs.find(pair => pair.id === pairId) || window.SW_DATA.soundPairs[0];
}

function renderWorlds() {
  const worlds = qs("#worlds");
  worlds.innerHTML = window.SW_DATA.soundPairs.map(pair => {
    const stats = state.pairStats[pair.id] || { correct: 0, wrong: 0 };
    const total = stats.correct + stats.wrong;
    const pct = total ? Math.round((stats.correct / total) * 100) : 0;
    return `
      <article class="world" style="--world-glow:${pair.glow || "rgba(255,47,179,0.35)"}">
        <div>
          <div class="crystal">${pair.icon}</div>
          <p class="kicker">Portal ${pair.code || pair.id.toUpperCase()}</p>
          <h3>${pair.title}</h3>
          <p>${pair.description}</p>
          <div class="world-meter"><span style="width:${pct}%"></span></div>
          <small>${total ? `${pct}% de acerto neste portal` : "Ainda sem treino"}</small>
        </div>
        <button class="primary" data-start-pair="${pair.id}">Entrar na arena</button>
      </article>
    `;
  }).join("");

  qsa("[data-start-pair]").forEach(button => {
    button.addEventListener("click", () => {
      state.activePairId = button.dataset.startPair;
      saveState();
      audio().playSfx("open");
      switchScreen("mission");
      newMission();
    });
  });
}

function renderModeChips() {
  const el = qs("#modeChips");
  el.innerHTML = window.SW_DATA.missionModes.map(mode => `
    <button class="mode-chip ${state.activeMode === mode.id ? "active" : ""}" type="button" data-mode="${mode.id}">${mode.label}</button>
  `).join("");

  qsa("[data-mode]").forEach(button => {
    button.addEventListener("click", () => {
      state.activeMode = button.dataset.mode;
      bossQueue = [];
      saveState();
      renderModeChips();
      newMission();
    });
  });
}

function allWordsForPair(pair) {
  const code = pair.code || pair.id.toUpperCase();
  const custom = state.customErrors
    .filter(error => error.pair === code || normalize(error.pair).replace("/", "") === pair.id)
    .map(error => ({
      id: error.id,
      correct: error.correct,
      distractor: error.wrong,
      target: inferTarget(pair, error.correct, error.wrong),
      prompt: error.sentence ? `O glitch apareceu nesta cena: “${error.sentence}”` : `Neutraliza o glitch da palavra: ${error.correct}`,
      sentence: error.sentence,
      custom: true,
      errorType: error.errorType || "erro real",
      source: error.source || "Backstage"
    }));

  return [...pair.words, ...custom].map((word, index) => ({
    ...word,
    key: wordKey(pair.id, word, index)
  }));
}

function wordKey(pairId, word, index = 0) {
  return `${pairId}:${normalize(word.correct)}:${normalize(word.distractor)}:${word.id || index}`;
}

function inferTarget(pair, correct, wrong) {
  const c = normalize(correct);
  const w = normalize(wrong);
  return pair.letters.find(letter => c.includes(letter) && !w.includes(letter)) || pair.letters.find(letter => c.includes(letter)) || pair.letters[0];
}

function selectWord(pair) {
  const words = allWordsForPair(pair);
  if (!words.length) return null;

  const today = todayNumber();
  const due = words.filter(word => {
    const s = state.wordStats[word.key];
    return !s || !s.reviewAfter || s.reviewAfter <= today || s.wrong > 0;
  });

  const pool = due.length ? due : words;
  pool.sort((a, b) => scoreWord(b) - scoreWord(a));

  const top = pool.slice(0, Math.min(4, pool.length));
  return top[Math.floor(Math.random() * top.length)];
}

function scoreWord(word) {
  const s = state.wordStats[word.key] || { correct: 0, wrong: 0, streak: 0 };
  let score = 10;
  score += word.custom ? 8 : 0;
  score += s.wrong * 5;
  score -= s.streak * 2;
  return score;
}

function currentMode() {
  return window.SW_DATA.missionModes.find(mode => mode.id === state.activeMode) || window.SW_DATA.missionModes[0];
}

function newMission() {
  const pair = getPair();
  let mode = currentMode();

  if (mode.id === "boss") {
    const next = nextBossChallenge(pair);
    if (!next) {
      qs("#challengeTitle").textContent = "Boss ainda bloqueado";
      qs("#challengePrompt").textContent = "Guarda pelo menos 3 glitches reais neste portal para abrir o Boss semanal.";
      qs("#choices").innerHTML = "";
      qs("#feedback").textContent = "Vai ao Backstage e regista erros reais encontrados em textos ou ditados.";
      qs("#feedback").className = "feedback";
      return;
    }
    currentChallenge = next;
    mode = { id: next.mode, label: "Boss", title: "Boss dos glitches reais" };
  } else {
    const word = selectWord(pair);
    if (!word) return;
    currentChallenge = { pair, word, answer: word.correct, mode: mode.id };
  }

  audio().setMode("battle");
  qs("#missionBadge").textContent = `${pair.title} · ${pair.code || ""}`;
  qs("#missionMode").textContent = mode.label;
  qs("#monsterName").textContent = pair.monster || "Glitch";
  qs("#challengeTitle").textContent = mode.title || randomTitle();
  qs("#feedback").textContent = "";
  qs("#feedback").className = "feedback";

  renderChallenge(currentChallenge);
  updateBattleExtras();
}

function nextBossChallenge(pair) {
  if (!bossQueue.length) {
    const real = allWordsForPair(pair).filter(word => word.custom);
    if (real.length < 3) return null;
    bossQueue = shuffle(real).slice(0, 5).map((word, index) => ({
      pair,
      word,
      answer: word.correct,
      mode: index % 2 === 0 ? "correct" : "write",
      boss: true,
      bossStep: index + 1,
      bossTotal: Math.min(5, real.length)
    }));
  }
  return bossQueue.shift();
}

function renderChallenge(challenge) {
  const { pair, word, mode } = challenge;

  if (mode === "choose") {
    qs("#challengePrompt").textContent = word.prompt;
    const choices = shuffle([word.correct, word.distractor]);
    qs("#choices").innerHTML = choices.map(choice => `<button class="choice" data-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>`).join("");
    qsa("[data-choice]").forEach(button => button.addEventListener("click", () => answer(button.dataset.choice)));
    return;
  }

  if (mode === "letter") {
    const missing = hideTarget(word.correct, word.target, pair.letters);
    qs("#challengePrompt").innerHTML = `<span class="prompt-small">${escapeHtml(word.prompt)}</span><strong class="missing-word">${escapeHtml(missing)}</strong>`;
    qs("#choices").innerHTML = pair.letters.map(letter => `<button class="choice" data-choice="${escapeHtml(letter)}">${escapeHtml(letter.toUpperCase())}</button>`).join("");
    qsa("[data-choice]").forEach(button => button.addEventListener("click", () => answer(button.dataset.choice, word.target)));
    return;
  }

  if (mode === "write") {
    qs("#challengePrompt").textContent = `Escuta/lê a pista e escreve a palavra final: ${word.prompt}`;
    qs("#choices").innerHTML = inputMissionHtml("Escreve aqui a palavra final", "Validar palavra");
    bindInputMission();
    return;
  }

  if (mode === "correct") {
    const sentence = word.sentence || `O glitch escreveu “${word.distractor}”.`;
    qs("#challengePrompt").innerHTML = `<span class="prompt-small">Corrige só o glitch principal.</span><strong class="glitch-sentence">${escapeHtml(sentence)}</strong>`;
    qs("#choices").innerHTML = inputMissionHtml("Escreve a palavra corrigida", "Corrigir glitch");
    bindInputMission();
    return;
  }
}

function hideTarget(correct, target, letters) {
  const ordered = [...letters].sort((a, b) => b.length - a.length);
  const needle = target || ordered.find(letter => normalize(correct).includes(letter)) || ordered[0];
  const re = new RegExp(needle, "i");
  return correct.replace(re, "_");
}

function inputMissionHtml(placeholder, buttonLabel) {
  return `
    <div class="input-mission">
      <input id="typedAnswer" autocomplete="off" placeholder="${escapeHtml(placeholder)}">
      <button id="submitTypedAnswer" class="primary" type="button">${escapeHtml(buttonLabel)}</button>
    </div>
  `;
}

function bindInputMission() {
  const input = qs("#typedAnswer");
  const submit = qs("#submitTypedAnswer");
  if (!input || !submit) return;
  input.focus();
  submit.addEventListener("click", () => answer(input.value));
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") answer(input.value);
  });
}

function randomTitle() {
  const titles = ["Escolhe o ataque certo", "Derrota o glitch", "Qual desbloqueia o portal?", "Ativa a palavra final", "Salva o refrão"];
  return titles[Math.floor(Math.random() * titles.length)];
}

function answer(choice, overrideAnswer = null) {
  if (!currentChallenge) return;

  const expected = overrideAnswer || currentChallenge.answer;
  const correct = normalize(choice) === normalize(expected);
  recordResult(currentChallenge, correct);

  if (correct) {
    state.streak += 1;
    state.completed += 1;
    state.xp += 15 + Math.min(state.streak, 12) + modeBonus(currentChallenge.mode);
    state.coins += 10 + Math.floor(state.streak / 3);

    qs("#feedback").textContent = state.streak >= 5
      ? `SUPER REFRÃO! Combo x${state.streak}. O público está ao rubro!`
      : `Boom! Glitch derrotado. Combo x${state.streak}.`;
    qs("#feedback").className = "feedback good pop";
    audio().playSfx(state.streak >= 5 ? "card" : "correct");
    burstConfetti(state.streak >= 5 ? 32 : 14);
  } else {
    state.streak = 0;
    qs("#feedback").textContent = `O glitch escapou por pouco. A resposta-alvo era “${expected}”.`;
    qs("#feedback").className = "feedback bad pop";
    audio().playSfx("wrong");
  }

  saveState();
  renderWorlds();
  setTimeout(newMission, correct ? 1250 : 1900);
}

function modeBonus(mode) {
  return { choose: 0, letter: 3, write: 7, correct: 7, boss: 15 }[mode] || 0;
}

function recordResult(challenge, isCorrect) {
  const pairId = challenge.pair.id;
  const mode = challenge.mode;
  const key = challenge.word.key;
  const today = todayNumber();

  state.pairStats[pairId] = state.pairStats[pairId] || { correct: 0, wrong: 0 };
  state.modeStats[mode] = state.modeStats[mode] || { correct: 0, wrong: 0 };
  state.wordStats[key] = state.wordStats[key] || { correct: 0, wrong: 0, streak: 0, mastered: false, reviewAfter: today };

  const wordStats = state.wordStats[key];
  if (isCorrect) {
    state.pairStats[pairId].correct += 1;
    state.modeStats[mode].correct += 1;
    wordStats.correct += 1;
    wordStats.streak += 1;
    wordStats.reviewAfter = today + Math.min(7, Math.max(1, wordStats.streak));
    wordStats.mastered = wordStats.streak >= 5;
  } else {
    state.pairStats[pairId].wrong += 1;
    state.modeStats[mode].wrong += 1;
    wordStats.wrong += 1;
    wordStats.streak = 0;
    wordStats.mastered = false;
    wordStats.reviewAfter = today;
  }
  wordStats.lastSeen = new Date().toISOString();
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
      errorType: String(form.get("errorType")).trim(),
      source: String(form.get("source")).trim(),
      sentence: String(form.get("sentence")).trim(),
      difficulty: String(form.get("difficulty")).trim(),
      createdAt: new Date().toISOString()
    };

    if (!entry.correct || !entry.wrong) return;

    state.customErrors.unshift(entry);
    event.currentTarget.reset();
    saveState();
    renderCustomErrors();
    audio().playSfx("card");
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

  qs("#resetDataBtn").addEventListener("click", () => {
    const keepGlitches = [...state.customErrors];
    if (!window.confirm(`Queres repor o jogo? As pontuações, evolução e perfis de leitura serão apagados. Os ${keepGlitches.length} Glitch(es) guardados no Backstage serão mantidos.`)) return;
    state = { ...defaultState, customErrors: keepGlitches };
    localStorage.removeItem("sound-warriors-state-v1");
    localStorage.removeItem("sound-warriors-state-v2");
    localStorage.removeItem("sound-warriors-reading-v2");
    saveState();
    renderWorlds();
    renderModeChips();
    renderCustomErrors();
    qs("#feedback").textContent = "Dados repostos. Os Glitches adicionados continuam guardados.";
    qs("#feedback").className = "feedback good";
  });
}

function renderCustomErrors() {
  const list = qs("#customErrors");
  if (!state.customErrors.length) {
    list.innerHTML = `<article class="error-item"><p>Ainda não há glitches personalizados. Quando encontrares um erro real num texto, ditado ou leitura, guarda-o aqui e ele entra nas próximas batalhas.</p></article>`;
    return;
  }

  list.innerHTML = state.customErrors.map(error => `
    <article class="error-item">
      <p><strong>${escapeHtml(error.correct)}</strong> venceu <strong>${escapeHtml(error.wrong)}</strong> · Portal ${escapeHtml(error.pair)} · ${escapeHtml(error.difficulty)}</p>
      <div class="error-tags">
        <span>${escapeHtml(error.errorType || "erro real")}</span>
        <span>${escapeHtml(error.source || "Backstage")}</span>
      </div>
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
    const label = total < 6 ? "em arranque" : pct >= 85 ? "estável" : pct >= 65 ? "em treino" : "crítico";
    return `
      <article class="stat">
        <h3>${pair.title}</h3>
        <div class="big">${pct}%</div>
        <p>${s.correct} vitórias · ${s.wrong} glitches fugiram · ${label}</p>
      </article>
    `;
  }).join("");

  const modeCards = window.SW_DATA.missionModes.filter(mode => mode.id !== "boss").map(mode => {
    const s = state.modeStats[mode.id] || { correct: 0, wrong: 0 };
    const total = s.correct + s.wrong;
    const pct = total ? Math.round((s.correct / total) * 100) : 0;
    return `<article class="stat compact-stat"><h3>${mode.label}</h3><div class="big">${pct}%</div><p>${total} tentativas</p></article>`;
  }).join("");

  const mastered = Object.values(state.wordStats).filter(w => w.mastered).length;
  const focus = weakestPairLabel();

  stats.innerHTML = `
    <article class="stat"><h3>Próximo foco</h3><div class="big small-big">${escapeHtml(focus)}</div><p>Escolhe este portal na próxima sessão curta.</p></article>
    <article class="stat"><h3>Batalhas ganhas</h3><div class="big">${state.completed}</div><p>Total de vitórias no palco.</p></article>
    <article class="stat"><h3>Combo atual</h3><div class="big">${state.streak}</div><p>Sequência viva de ataques certos.</p></article>
    <article class="stat"><h3>Palavras dominadas</h3><div class="big">${mastered}</div><p>5 acertos seguidos com revisão espaçada.</p></article>
    <article class="stat"><h3>Glitches próprios</h3><div class="big">${state.customErrors.length}</div><p>Criados no Backstage.</p></article>
    ${pairCards}
    ${modeCards}
  `;
}

function weakestPairLabel() {
  let weakest = null;
  window.SW_DATA.soundPairs.forEach(pair => {
    const s = state.pairStats[pair.id] || { correct: 0, wrong: 0 };
    const total = s.correct + s.wrong;
    const pct = total ? s.correct / total : 0;
    const score = total < 4 ? -1 : pct;
    if (!weakest || score < weakest.score) weakest = { score, label: pair.code || pair.title };
  });
  return weakest ? weakest.label : "F/V";
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
  audio().playSfx("open");
  if (button.dataset.screenJump === "mission") newMission();
}));

qs("#newMissionBtn").addEventListener("click", () => {
  audio().playSfx("open");
  newMission();
});

qs("#hintBtn").addEventListener("click", () => {
  const pair = currentChallenge?.pair || getPair();
  qs("#feedback").textContent = pair.hint;
  qs("#feedback").className = "feedback pop";
  audio().playSfx("open");
});

audio().init();
renderHud();
renderWorlds();
renderModeChips();
renderRewards();
renderCustomErrors();
renderProgress();
updateBattleExtras();
setupLab();
