(() => {
  const STORE = 'sound-warriors-reading-v2';
  const texts = Array.isArray(window.SW_READING_TEXTS) ? window.SW_READING_TEXTS : [];
  const panels = ['setupPanel','readyPanel','countdownPanel','readingPanel','finishPanel','markPanel','resultPanel'];
  const $ = id => document.getElementById(id);
  const state = load();
  let activeText = null;
  let timer = null;
  let remaining = 60;
  let selectedWordIndex = -1;
  let feeling = '';

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE));
      if (saved && Array.is