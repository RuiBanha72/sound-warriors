(() => {
  'use strict';
  const KEY = 'sound-warriors-reading-v2', VERSION = 2, DURATION = 60;
  const $ = id => document.getElementById(id);
  const texts = Array.isArray(window.SW_READING_TEXTS) ? window.SW_READING_TEXTS.filter(t => t && t.id && t.title && t.text) : [];
  const state = loadState();
  let activeText, selectedIndex = -1, feeling = '', timerId, countdownId, endsAt;
  const panels = ['setupPanel', 'readyPanel', 'countdownPanel', 'readingPanel', 'finishPanel', 'markPanel', 'resultPanel'];

  function loadState() {
    const fallback = { version: VERSION, profiles: [{ id: 'perfil-inicial', name: 'Perfil inicial' }], activeProfileId: 'perfil-inicial', attempts: [] };
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (!saved || !Array.isArray(saved.profiles) || !Array.isArray(saved.attempts)) return fallback;
      const profiles = saved.profiles.filter(p => p && typeof p.id === 'string' && typeof p.name === 'string' && p.name.trim());
      const attempts = saved.attempts.filter(a => a && typeof a.profileId === 'string' && typeof a.textId === 'string' && Number.isFinite(Number(a.wordsRead)));
      if (!profiles.length) return fallback;
      return { version: VERSION, profiles, attempts, activeProfileId: profiles.some(p => p.id === saved.activeProfileId) ? saved.activeProfileId : profiles[0].id };
    } catch (_) { return fallback; }
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { announce('Não foi possível guardar neste dispositivo.'); } }
  function profile() { return state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0]; }
  function words(text) { return String(text).trim().match(/\S+/g) || []; }
  function show(id) { panels.forEach(p => $(p).classList.toggle('hidden', p !== id)); window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  function announce(message) { const el = $('readingStatus'); if (el) el.textContent = message; }
  function element(tag, text, className) { const e = document.createElement(tag); if (text != null) e.textContent = text; if (className) e.className = className; return e; }
  function clearTimers() { clearInterval(timerId); clearTimeout(countdownId); timerId = countdownId = null; }

  function renderProfiles() {
    const select = $('profileSelect'); select.replaceChildren();
    state.profiles.forEach(p => { const option = element('option', p.name); option.value = p.id; select.append(option); });
    select.value = state.activeProfileId;
  }
  function renderTexts() {
    const select = $('textSelect'); select.replaceChildren();
    texts.forEach(t => { const option = element('option', t.title); option.value = t.id; select.append(option); });
    $('prepareBtn').disabled = !texts.length;
    renderTextInfo();
  }
  function selectedText() { return texts.find(t => t.id === $('textSelect').value) || texts[0]; }
  function renderTextInfo() {
    const t = selectedText();
    $('textInfo').textContent = t ? `${t.level} · ${t.theme} · ${words(t.text).length} palavras` : 'Ainda não existem textos disponíveis. Verifica o ficheiro de textos.';
  }
  function prepare() {
    activeText = $('choiceMode').value === 'random' ? texts[Math.floor(Math.random() * texts.length)] : selectedText();
    if (!activeText) return announce('Ainda não existem textos disponíveis.');
    $('readyTitle').textContent = activeText.title; show('readyPanel');
  }
  function startCountdown() {
    clearTimers(); let count = 3; show('countdownPanel');
    const next = () => { $('countdownValue').textContent = count; announce(count ? `Começa em ${count}` : 'Começa agora'); if (count-- > 0) countdownId = setTimeout(next, 1000); else startReading(); };
    next();
  }
  function startReading() {
    endsAt = Date.now() + DURATION * 1000;
    $('readingProfile').textContent = profile().name; $('readingTitle').textContent = activeText.title; $('readingText').textContent = activeText.text;
    show('readingPanel'); updateTimer(); timerId = setInterval(updateTimer, 200);
  }
  function updateTimer() {
    const seconds = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)); $('timer').textContent = seconds;
    if (!seconds) finishReading();
  }
  function finishReading() { clearTimers(); $('readingText').textContent = ''; announce('Terminou o minuto de leitura.'); show('finishPanel'); }
  function buildMarking() {
    selectedIndex = -1; $('saveAttemptBtn').disabled = true; $('selectedSummary').textContent = 'Ainda não selecionaste uma palavra.';
    const box = $('markText'); box.replaceChildren();
    words(activeText.text).forEach((word, index) => { const b = element('button', word, 'mark-word'); b.type = 'button'; b.dataset.index = index; b.setAttribute('aria-label', `Selecionar a palavra ${index + 1}: ${word}`); b.addEventListener('click', () => selectWord(index)); box.append(b, document.createTextNode(' ')); });
    show('markPanel');
  }
  function selectWord(index) {
    selectedIndex = index; [...$('markText').querySelectorAll('.mark-word')].forEach((b, i) => { b.classList.toggle('before-selected', i < index); b.classList.toggle('selected', i === index); b.setAttribute('aria-pressed', String(i === index)); });
    $('selectedSummary').textContent = `Última palavra selecionada: ${index + 1}.ª palavra · ${index + 1} palavras lidas.`; $('saveAttemptBtn').disabled = false;
  }
  function saveAttempt() {
    if (selectedIndex < 0 || !activeText) return;
    const wordsRead = selectedIndex + 1, prior = state.attempts.filter(a => a.profileId === profile().id && a.textId === activeText.id).sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
    const attempt = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, version: VERSION, profileId: profile().id, textId: activeText.id, textTitle: activeText.title, wordsRead, totalWords: words(activeText.text).length, durationSeconds: DURATION, feeling, date: new Date().toISOString() };
    state.attempts.push(attempt); persist(); const delta = prior ? wordsRead - Number(prior.wordsRead) : null;
    $('resultHeadline').textContent = `${wordsRead} palavras em 1 minuto`; renderResult(wordsRead, attempt.totalWords, delta); renderHistory(); show('resultPanel');
  }
  function renderResult(read, total, delta) {
    const box = $('resultStats'); box.replaceChildren(); [['Palavras lidas', read], ['Total do texto', total], ['Em relação à anterior', delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}`]].forEach(([label, value]) => { const d = element('div', null, 'result-stat'); d.append(element('span', label), element('strong', String(value))); box.append(d); });
    $('resultMessage').textContent = delta == null ? 'Esta é a primeira leitura deste texto. A próxima comparação será apenas com esta tentativa.' : delta > 0 ? `Leste mais ${delta} palavra${delta === 1 ? '' : 's'} do que na tentativa anterior deste texto.` : delta === 0 ? 'Mantiveste o resultado. A consistência também é progresso.' : 'Hoje este texto exigiu mais esforço. Isso faz parte do treino; podes voltar a ele com calma.';
  }
  function renderHistory() {
    const attempts = state.attempts.filter(a => a.profileId === profile().id).sort((a,b) => Date.parse(b.date) - Date.parse(a.date));
    $('historyProfile').textContent = profile().name; const total = attempts.length, best = total ? Math.max(...attempts.map(a => Number(a.wordsRead))) : 0, average = total ? Math.round(attempts.reduce((n,a) => n + Number(a.wordsRead), 0) / total) : 0;
    const cards = $('summaryCards'); cards.replaceChildren(); [['Tentativas', total], ['Melhor resultado', best], ['Média', average]].forEach(([label,value]) => { const d = element('div', null, 'summary-card'); d.append(element('span', label), element('strong', String(value))); cards.append(d); });
    const list = $('historyList'); list.replaceChildren(); if (!total) { list.append(element('p', 'Ainda não existem leituras guardadas para este perfil.')); return; }
    attempts.slice(0, 12).forEach(a => { const row = element('div', null, 'history-item'), left = element('div'); left.append(element('strong', a.textTitle || 'Texto sem título'), element('br'), element('small', `${new Date(a.date).toLocaleDateString('pt-PT')} · ${a.feeling || 'Sem indicação'}`)); row.append(left, element('span', `${a.wordsRead} palavras`)); list.append(row); });
  }
  function addProfile() { const name = $('newProfileName').value.trim(); const error = $('profileError'); if (!name) { error.textContent = 'Escreve um nome para o perfil.'; return; } if (state.profiles.some(p => p.name.localeCompare(name, 'pt-PT', { sensitivity: 'accent' }) === 0)) { error.textContent = 'Já existe um perfil com esse nome.'; return; } const id = `perfil-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; state.profiles.push({ id, name }); state.activeProfileId = id; persist(); $('profileDialog').close(); renderProfiles(); renderHistory(); }
  function reset() { clearTimers(); feeling = ''; selectedIndex = -1; show('setupPanel'); }

  $('profileSelect').addEventListener('change', e => { state.activeProfileId = e.target.value; persist(); renderHistory(); });
  $('addProfileBtn').addEventListener('click', () => { $('profileError').textContent = ''; $('newProfileName').value = ''; $('profileDialog').showModal(); $('newProfileName').focus(); });
  $('profileForm').addEventListener('submit', e => { e.preventDefault(); addProfile(); }); $('profileCancelBtn').addEventListener('click', () => $('profileDialog').close());
  $('choiceMode').addEventListener('change', e => $('textSelectLabel').classList.toggle('hidden', e.target.value === 'random'));
  $('textSelect').addEventListener('change', renderTextInfo); $('prepareBtn').addEventListener('click', prepare); $('startBtn').addEventListener('click', startCountdown); $('cancelReadyBtn').addEventListener('click', reset);
  document.querySelectorAll('.feeling-btn').forEach(b => b.addEventListener('click', () => { feeling = b.dataset.feeling || ''; buildMarking(); })); $('saveAttemptBtn').addEventListener('click', saveAttempt); $('repeatBtn').addEventListener('click', () => show('readyPanel')); $('newReadingBtn').addEventListener('click', reset); window.addEventListener('beforeunload', clearTimers);
  renderProfiles(); renderTexts(); renderHistory(); show('setupPanel'); if (!texts.length) announce('O ficheiro de textos não foi carregado ou não contém textos válidos.');
})();
