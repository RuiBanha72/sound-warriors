(() => {
  const texts = window.SW_READING_TEXTS || [];
  const STORAGE = 'sw-reading-v1';
  const state = { profile: '', text: null, feeling: '', selectedWord: 0, timer: null };
  const $ = (id) => document.getElementById(id);
  const panels = ['setupPanel','readyPanel','countdownPanel','readingPanel','finishPanel','markPanel','resultPanel'];

  function loadData() {
    try { return JSON.parse(localStorage.getItem(STORAGE)) || { profiles: ['Simone'], attempts: [] }; }
    catch { return { profiles: ['Simone'], attempts: [] }; }
  }
  function saveData(data) { localStorage.setItem(STORAGE, JSON.stringify(data)); }
  function show(id) { panels.forEach(p => $(p)?.classList.toggle('hidden', p !== id)); }
  function words(text) { return text.trim().split(/\s+/); }
  function selectedText() {
    if ($('choiceMode').value === 'random') return texts[Math.floor(Math.random() * texts.length)];
    return texts.find(t => t.id === $('textSelect').value) || texts[0];
  }

  function renderProfiles() {
    const data = loadData();
    $('profileSelect').innerHTML = data.profiles.map(p => `<option>${p}</option>`).join('');
    if (!state.profile || !data.profiles.includes(state.profile)) state.profile = data.profiles[0] || 'Simone';
    $('profileSelect').value = state.profile;
    renderHistory();
  }
  function renderTexts() {
    $('textSelect').innerHTML = texts.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
    updateTextInfo();
  }
  function updateTextInfo() {
    const t = selectedText();
    if (!t) return;
    $('textInfo').textContent = `${t.level} · ${t.theme} · ${words(t.text).length} palavras`;
    $('textSelectLabel').classList.toggle('hidden', $('choiceMode').value === 'random');
  }
  function renderHistory() {
    const data = loadData();
    const attempts = data.attempts.filter(a => a.profile === state.profile).sort((a,b) => b.date.localeCompare(a.date));
    $('historyProfile').textContent = state.profile;
    const best = attempts.reduce((m,a) => Math.max(m,a.words), 0);
    const avg = attempts.length ? Math.round(attempts.reduce((s,a)=>s+a.words,0)/attempts.length) : 0;
    $('summaryCards').innerHTML = [
      ['Tentativas', attempts.length], ['Melhor marca', best], ['Média', avg]
    ].map(([l,v]) => `<div class="summary-card"><span>${l}</span><strong>${v}</strong></div>`).join('');
    $('historyList').innerHTML = attempts.length ? attempts.map(a => {
      const d = new Date(a.date).toLocaleDateString('pt-PT');
      return `<div class="history-item"><div><b>${a.title}</b><br><small>${d} · ${a.feeling || ''}</small></div><strong>${a.words} palavras</strong><span>${a.delta > 0 ? '+' + a.delta : a.delta || '—'}</span></div>`;
    }).join('') : '<p>Ainda não existem tentativas neste perfil.</p>';
  }

  function startCountdown() {
    show('countdownPanel');
    let n = 3; $('countdownValue').textContent = n;
    const c = setInterval(() => {
      n -= 1; $('countdownValue').textContent = n;
      if (n === 0) { clearInterval(c); setTimeout(beginReading, 500); }
    }, 800);
  }
  function beginReading() {
    show('readingPanel');
    $('readingProfile').textContent = state.profile;
    $('readingTitle').textContent = state.text.title;
    $('readingText').textContent = state.text.text;
    let remaining = 60; $('timer').textContent = remaining;
    state.timer = setInterval(() => {
      remaining -= 1; $('timer').textContent = remaining;
      if (remaining <= 0) { clearInterval(state.timer); finishReading(); }
    }, 1000);
  }
  function finishReading() { show('finishPanel'); }
  function renderMarking() {
    show('markPanel');
    const ws = words(state.text.text);
    $('markText').innerHTML = ws.map((w,i) => `<span class="mark-word" data-i="${i+1}">${w}</span> `).join('');
    state.selectedWord = 0;
    $('selectedSummary').textContent = 'Ainda não selecionaste uma palavra.';
    $('saveAttemptBtn').disabled = true;
  }
  function saveAttempt() {
    const data = loadData();
    const previous = data.attempts.filter(a => a.profile === state.profile && a.textId === state.text.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
    const attempt = {
      profile: state.profile, textId: state.text.id, title: state.text.title,
      words: state.selectedWord, feeling: state.feeling, date: new Date().toISOString(),
      delta: previous ? state.selectedWord - previous.words : 0
    };
    data.attempts.push(attempt); saveData(data);
    $('resultHeadline').textContent = `${state.selectedWord} palavras em 1 minuto`;
    $('resultStats').innerHTML = `<div class="result-stat"><span>Resultado</span><strong>${state.selectedWord}</strong><small>palavras</small></div><div class="result-stat"><span>Comparação</span><strong>${attempt.delta > 0 ? '+' + attempt.delta : attempt.delta || '—'}</strong><small>com a tentativa anterior</small></div>`;
    $('resultMessage').textContent = attempt.delta > 0 ? 'O texto já está a ficar mais fácil. Excelente evolução.' : 'Cada repetição ajuda o cérebro a automatizar a leitura.';
    show('resultPanel'); renderHistory();
  }

  $('addProfileBtn').addEventListener('click', () => {
    const name = prompt('Nome do novo perfil:')?.trim(); if (!name) return;
    const data = loadData(); if (!data.profiles.includes(name)) data.profiles.push(name); saveData(data); state.profile = name; renderProfiles();
  });
  $('profileSelect').addEventListener('change', e => { state.profile = e.target.value; renderHistory(); });
  $('choiceMode').addEventListener('change', updateTextInfo);
  $('textSelect').addEventListener('change', updateTextInfo);
  $('prepareBtn').addEventListener('click', () => { state.profile = $('profileSelect').value; state.text = selectedText(); $('readyTitle').textContent = state.text.title; show('readyPanel'); });
  $('cancelReadyBtn').addEventListener('click', () => show('setupPanel'));
  $('startBtn').addEventListener('click', startCountdown);
  document.querySelectorAll('.feeling-btn').forEach(b => b.addEventListener('click', () => { state.feeling = b.dataset.feeling; renderMarking(); }));
  $('markText').addEventListener('click', e => {
    const word = e.target.closest('.mark-word'); if (!word) return;
    state.selectedWord = Number(word.dataset.i);
    document.querySelectorAll('.mark-word').forEach(w => {
      const i = Number(w.dataset.i); w.classList.toggle('selected', i === state.selectedWord); w.classList.toggle('before-selected', i < state.selectedWord);
    });
    $('selectedSummary').textContent = `${state.selectedWord} palavras lidas.`; $('saveAttemptBtn').disabled = false;
  });
  $('saveAttemptBtn').addEventListener('click', saveAttempt);
  $('repeatBtn').addEventListener('click', () => { $('readyTitle').textContent = state.text.title; show('readyPanel'); });
  $('newReadingBtn').addEventListener('click', () => show('setupPanel'));

  renderProfiles(); renderTexts(); show('setupPanel');
})();