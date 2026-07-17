(() => {
  const STORAGE_KEY = "sound-warriors-reading-v1";
  const texts = window.SW_READING_TEXTS || [];
  const $ = selector => document.querySelector(selector);
  const panels = ["setupPanel","readyPanel","countdownPanel","readingPanel","reflectionPanel","markPanel","resultPanel"];
  let state = load();
  let selectedText = null;
  let selectedWordIndex = null;
  let feeling = "";
  let timerId = null;

  function load(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(saved) return saved;
    }catch{}
    return { profiles:[{id:"simone",name:"Simone"},{id:"rui",name:"Rui"}], activeProfileId:"simone", attempts:[] };
  }

  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function uid(){ return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()); }
  function activeProfile(){ return state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0]; }
  function wordsFor(text){ return text.trim().split(/\s+/); }
  function wordCount(text){ return wordsFor(text).length; }
  function show(id){ panels.forEach(p => $("#"+p).classList.toggle("hidden", p !== id)); window.scrollTo({top:0,behavior:"smooth"}); }

  function renderProfiles(){
    $("#profileList").innerHTML = state.profiles.map(p => `<button type="button" class="profile-chip ${p.id===state.activeProfileId?"active":""}" data-profile="${p.id}">${escapeHtml(p.name)}</button>`).join("");
    document.querySelectorAll("[data-profile]").forEach(btn => btn.addEventListener("click",()=>{
      state.activeProfileId = btn.dataset.profile; save(); renderProfiles(); renderHistory();
    }));
  }

  function renderTextOptions(){
    $("#textSelect").innerHTML = texts.map(t => `<option value="${t.id}">${escapeHtml(t.title)} · ${wordCount(t.text)} palavras</option>`).join("");
    updateSelectedInfo();
  }

  function chooseText(){
    if($("#textMode").value === "manual") return texts.find(t => t.id === $("#textSelect").value) || texts[0];
    const recent = state.attempts.filter(a => a.profileId === state.activeProfileId).slice(-2).map(a => a.textId);
    const pool = texts.filter(t => !recent.includes(t.id));
    const source = pool.length ? pool : texts;
    return source[Math.floor(Math.random()*source.length)];
  }

  function updateSelectedInfo(){
    const manual = $("#textMode").value === "manual";
    $("#textSelectWrap").classList.toggle("hidden", !manual);
    const text = manual ? texts.find(t=>t.id===$("#textSelect").value) : null;
    $("#selectedTextInfo").textContent = manual && text
      ? `${text.title} · ${text.theme} · ${text.level} · ${wordCount(text.text)} palavras`
      : "O texto será escolhido aleatoriamente sem aparecer antes da contagem.";
  }

  function prepare(){
    if(!activeProfile()) return;
    selectedText = chooseText();
    selectedWordIndex = null;
    feeling = "";
    $("#readyTitle").textContent = `${activeProfile().name}, a história está escondida`;
    show("readyPanel");
  }

  function startCountdown(){
    show("countdownPanel");
    let n = 3;
    $("#countdownNumber").textContent = n;
    const id = setInterval(()=>{
      n -= 1;
      $("#countdownNumber").textContent = n;
      if(n <= 0){ clearInterval(id); setTimeout(startReading,450); }
    },800);
  }

  function startReading(){
    show("readingPanel");
    $("#readingTitle").textContent = selectedText.title;
    $("#readingText").textContent = selectedText.text;
    let remaining = 60;
    $("#timerValue").textContent = remaining;
    timerId = setInterval(()=>{
      remaining -= 1;
      $("#timerValue").textContent = remaining;
      if(remaining <= 0){ clearInterval(timerId); finishReading(); }
    },1000);
  }

  function finishReading(){
    $("#readingText").textContent = "";
    $("#reflectionQuestion").textContent = `${activeProfile().name}, como sentiste esta leitura?`;
    show("reflectionPanel");
  }

  function showMarking(selectedFeeling){
    feeling = selectedFeeling;
    const words = wordsFor(selectedText.text);
    $("#markText").innerHTML = words.map((word,index)=>`<span class="mark-word" data-word-index="${index}">${escapeHtml(word)}</span> `).join("");
    $("#markResult").textContent = "Ainda não selecionaste uma palavra.";
    $("#saveAttemptBtn").disabled = true;
    document.querySelectorAll("[data-word-index]").forEach(span=>span.addEventListener("click",()=>{
      selectedWordIndex = Number(span.dataset.wordIndex);
      document.querySelectorAll("[data-word-index]").forEach(w=>{
        const i = Number(w.dataset.wordIndex);
        w.classList.toggle("before-selected", i < selectedWordIndex);
        w.classList.toggle("selected", i === selectedWordIndex);
      });
      $("#markResult").textContent = `${selectedWordIndex + 1} palavras lidas em 60 segundos.`;
      $("#saveAttemptBtn").disabled = false;
    }));
    show("markPanel");
  }

  function saveAttempt(){
    if(selectedWordIndex === null) return;
    const count = selectedWordIndex + 1;
    const previous = attemptsForActive().filter(a=>a.textId===selectedText.id).slice(-1)[0];
    state.attempts.push({id:uid(),profileId:state.activeProfileId,textId:selectedText.id,textTitle:selectedText.title,words:count,feeling,date:new Date().toISOString()});
    save();
    $("#resultNumber").textContent = count;
    let msg = "Tentativa guardada. O objetivo é melhorar ao teu ritmo.";
    if(previous){
      const diff = count - previous.words;
      msg = diff > 0 ? `Melhoraste ${diff} palavras em relação à última leitura deste texto.` : diff === 0 ? "Mantiveste o resultado anterior. A consistência também conta." : "Hoje foi mais desafiante. Voltar ao mesmo texto ajuda o cérebro a automatizar.";
    } else {
      msg = "Este é o teu primeiro resultado neste texto. Já tens uma referência para a próxima tentativa.";
    }
    $("#resultMessage").textContent = msg;
    renderHistory();
    show("resultPanel");
  }

  function attemptsForActive(){ return state.attempts.filter(a=>a.profileId===state.activeProfileId); }

  function renderHistory(){
    const attempts = attemptsForActive();
    const values = attempts.map(a=>a.words);
    const best = values.length ? Math.max(...values) : 0;
    const average = values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0;
    const last = values.length ? values[values.length-1] : 0;
    $("#summaryCards").innerHTML = [
      ["Melhor",best],["Média",average],["Última",last],["Tentativas",attempts.length]
    ].map(([label,value])=>`<div class="summary-box"><small>${label}</small><strong>${value}</strong></div>`).join("");
    $("#historyList").innerHTML = attempts.length ? attempts.slice().reverse().map(a=>`<div class="history-row"><div><strong>${escapeHtml(a.textTitle)}</strong><br><small>${new Date(a.date).toLocaleDateString("pt-PT")} · ${escapeHtml(a.feeling||"")}</small></div><strong>${a.words} palavras</strong></div>`).join("") : `<div class="history-row"><span>Ainda não há tentativas guardadas neste perfil.</span></div>`;
  }

  function escapeHtml(value){ return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }

  $("#profileForm").addEventListener("submit",e=>{
    e.preventDefault();
    const name = $("#profileName").value.trim();
    if(!name) return;
    const profile = {id:uid(),name}; state.profiles.push(profile); state.activeProfileId = profile.id; save(); $("#profileName").value=""; renderProfiles(); renderHistory();
  });
  $("#textMode").addEventListener("change",updateSelectedInfo);
  $("#textSelect").addEventListener("change",updateSelectedInfo);
  $("#prepareBtn").addEventListener("click",prepare);
  $("#startBtn").addEventListener("click",startCountdown);
  document.querySelectorAll("[data-feeling]").forEach(b=>b.addEventListener("click",()=>showMarking(b.dataset.feeling)));
  $("#saveAttemptBtn").addEventListener("click",saveAttempt);
  $("#repeatBtn").addEventListener("click",()=>{ show("readyPanel"); });
  $("#newReadingBtn").addEventListener("click",()=>show("setupPanel"));

  renderProfiles(); renderTextOptions(); renderHistory(); show("setupPanel");
})();