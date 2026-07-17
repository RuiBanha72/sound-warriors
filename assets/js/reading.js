(() => {
  const STORE = 'sound-warriors-reading-v2';
  const texts = Array.isArray(window.SW_READING_TEXTS) ? window.SW_READING_TEXTS : [];
  const panels = ['setupPanel','readyPanel','countdownPanel','readingPanel','finishPanel','markPanel','resultPanel'];
  const $ = id => document.getElementById(id);
  let timer = null;
  let activeText = null;
  let remaining = 60;
  let selectedWordIndex = -1;
  let feeling = '';
  const state = load();

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE));
      if (saved && Array.isArray(saved.profiles) && Array.isArray(saved.attempts)) return saved;
    } catch (_) {}
    return {
      profiles: [{ id: 'simone', name: 'Simone' }],
      activeProfileId: 'simone',
      attempts: []
    };
  }

  function save() {
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  function show(id) {
    panels.forEach(panel => $(panel).classList.toggle('hidden', panel !== id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function currentProfile() {
    return state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0];
  }

  function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function renderProfiles() {
    $('profileSelect').innerHTML = state.profiles.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    $('profileSelect').value = state.activeProfileId;
  }

  function renderTexts() {
    $('textSelect').innerHTML = texts.map(t => `<option value="${t.id}">${escapeHtml(t.title)}</option>`).join('');
    renderTextInfo();
  }

  function renderTextInfo() {
    const text = texts.find(t => t.id === $('textSelect').value) || texts[0];
    $('textInfo').textContent = text ? `${text.level} · ${text.theme} · ${wordCount(text.text)} palavras` : 'Ainda não existem textos disponíveis.';
  }

  function chooseText() {
    if (!texts.length) return null;
    if ($('choiceMode').value === 'random') return texts[Math.floor(Math.random() * texts.length)];
    return texts.find(t => t.id === $('textSelect').value) || texts[0];
  }

  function prepareReading() {
    activeText = chooseText();
    if (!activeText) return alert('Não existem textos disponíveis.');
    $('readyTitle').textContent = activeText.title;
    show('readyPanel');
  }

  function startCountdown() {
    show('countdownPanel');
    let count = 3;
    $('countdownValue').textContent = count;
    const countdown = setInterval(() => {
      count -= 1;
      $('countdownValue').textContent = count;
      if (count <= 0) {
        clearInterval(countdown);
        startReading();
      }
    }, 1000);
  }

  function startReading() {
    remaining = 60;
    $('timer').textContent = remaining;
    $('readingProfile').textContent = currentProfile().name;
    $('readingTitle').textContent = activeText.title;
    $('readingText').textContent = activeText.text;
    show('readingPanel');
    timer = setInterval(() => {
      remaining -= 1;
      $('timer').textContent = remaining;
      if (remaining <= 0) finishReading();
    }, 1000);
  }

  function finishReading() {
    clearInterval(timer);
    timer = null;
    $('readingText').textContent = '';
    show('finishPanel');
  }

  function buildMarkingPanel() {
    selectedWordIndex = -1;
    $('saveAttemptBtn').disabled = true;
    $('selectedSummary').textContent = 'Ainda não selecionaste uma palavra.';
    const words = activeText.text.trim().split(/\s+/);
    $('markText').innerHTML = words.map((word, index) => `<span class="mark-word" data-index="${index}">${escapeHtml(word)}</span> `).join('');
    $('markText').querySelectorAll('.mark-word').forEach(span => {
      span.addEventListener('click', () => selectWord(Number(span.dataset.index)));
    });
    show('markPanel');
  }

  function selectWord(index) {
    selectedWordIndex = index;
    $('markText').querySelectorAll('.mark-word').forEach((span, i) => {
      span.classList.toggle('before-selected', i < index);
      span.classList.toggle('selected', i === index);
    });
    const count = index + 1;
    $('selectedSummary').textContent = `Última palavra selecionada: ${count}.ª palavra · ${count} palavras lidas.`;
    $('saveAttemptBtn').disabled = false;
  }

  function saveAttempt() {
    if (selectedWordIndex < 0) return;
    const wordsRead = selectedWordIndex + 1;
    const previous = state.attempts
      .filter(a => a.profileId === state.activeProfileId && a.textId === activeText.id)
      .sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    const attempt = {
      id: `${Date.now()}`,
      profileId: state.activeProfileId,
      textId: activeText.id,
      textTitle: activeText.title,
      wordsRead,
      feeling,
      date: new Date().toISOString()
    };
    state.attempts.push(attempt);
    save();
    const delta = previous ? wordsRead - previous.wordsRead : null;
    $('resultHeadline').textContent = `${wordsRead} palavras em 1 minuto`;
    $('resultStats').innerHTML = `
      <div class="result-stat"><span>Palavras</span><strong>${wordsRead}</strong></div>
      <div class="result-stat"><span>Texto</span><strong>${wordCount(activeText.text)}</strong></div>
      <div class="result-stat"><span>Evolução</span><strong>${delta === null ? '—' : `${delta >= 0 ? '+' : ''}${delta}`}</strong></div>`;
    $('resultMessage').textContent = delta === null
      ? 'Esta foi a primeira leitura deste texto. O próximo resultado será comparado apenas com este.'
      : delta > 0
        ? `Leste mais ${delta} palavra${delta === 1 ? '' : 's'} do que na tentativa anterior.`
        : delta === 0
          ? 'Mantiveste o mesmo resultado. A consistência também é progresso.'
          : 'Hoje o texto exigiu mais esforço. Repete-o noutro dia, sem pressão.';
    renderHistory();
    show('resultPanel');
  }

  function renderHistory() {
    const profile = currentProfile();
    const attempts = state.attempts.filter(a => a.profileId === profile.id).sort((a,b) => new Date(b.date) - new Date(a.date));
    $('historyProfile').textContent = profile.name;
    const best = attempts.length ? Math.max(...attempts.map(a => a.wordsRead)) : 0;
    const average = attempts.length ? Math.round(attempts.reduce((sum,a) => sum + a.wordsRead, 0) / attempts.length) : 0;
    $('summaryCards').innerHTML = `
      <div class="summary-card"><span>Tentativas</span><strong>${attempts.length}</strong></div>
      <div class="summary-card"><span>Melhor marca</span><strong>${best}</strong></div>
      <div class="summary-card"><span>Média</span><strong>${average}</strong></div>`;
    $('historyList').innerHTML = attempts.length ? attempts.slice(0, 12).map(a => `
      <div class="history-item">
        <div><strong>${escapeHtml(a.textTitle)}</strong><br><small>${new Date(a.date).toLocaleDateString('pt-PT')} · ${escapeHtml(a.feeling || 'Sem indicação')}</small></div>
        <span>${a.wordsRead} palavras</span>
      </div>`).join('') : '<p>Ainda não existem leituras guardadas para este perfil.</p>';
  }

  function addProfile() {
    const name = prompt('Nome do novo perfil:');
    if (!name || !name.trim()) return;
    const id = `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    state.profiles.push({ id, name: name.trim() });
    state.activeProfileId = id;
    save();
    renderProfiles();
    renderHistory();
  }

  function resetToSetup() {
    feeling = '';
    selectedWordIndex = -1;
    show('setupPanel');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
  }

  $('profileSelect').addEventListener('change', e => {
    state.activeProfileId = e.target.value;
    save();
    renderHistory();
  });
  $('addProfileBtn').addEventListener('click', addProfile);
  $('choiceMode').addEventListener('change', e => {
    $('textSelectLabel').classList.toggle('hidden', e.target.value === 'random');
  });
  $('textSelect').addEventListener('change', renderTextInfo);
  $('prepareBtn').addEventListener('click', prepareReading);
  $('startBtn').addEventListener('click', startCountdown);
  $('cancelReadyBtn').addEventListener('click', resetToSetup);
  document.querySelectorAll('.feeling-btn').forEach(button => {
    button.addEventListener('click', () => {
      feeling = button.dataset.feeling || '';
      buildMarkingPanel();
    });
  });
  $('saveAttemptBtn').addEventListener('click', saveAttempt);
  $('repeatBtn').addEventListener('click', () => show('readyPanel'));
  $('newReadingBtn').addEventListener('click', resetToSetup);

  renderProfiles();
  renderTexts();
  renderHistory();
  show('setupPanel');
})();
