(() => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  function createSilentAudioApi() {
    return {
      enabled: () => false,
      setMusicEnabled: () => {},
      toggle: () => {},
      setMode: () => {},
      playSfx: () => {},
      init: () => {}
    };
  }

  if (!AudioContextClass) {
    window.SW_AUDIO = createSilentAudioApi();
    return;
  }

  const STORAGE_KEY = "sound-warriors-audio-enabled";

  let ctx = null;
  let master = null;
  let musicGain = null;
  let fxGain = null;
  let loopTimer = null;
  let step = 0;
  let mode = "menu";
  let musicOn = false;

  const bpm = 118;
  const stepSeconds = 60 / bpm / 2;
  const stepMs = stepSeconds * 1000;

  const menuPattern = [392, 523.25, 622.25, 523.25, 466.16, 392, 311.13, 392];
  const battlePattern = [220, 329.63, 392, 440, 329.63, 523.25, 392, 659.25];

  function ensureContext() {
    if (ctx) return ctx;

    ctx = new AudioContextClass();
    master = ctx.createGain();
    musicGain = ctx.createGain();
    fxGain = ctx.createGain();

    master.gain.value = 0.95;
    musicGain.gain.value = 0.48;
    fxGain.gain.value = 0.85;

    musicGain.connect(master);
    fxGain.connect(master);
    master.connect(ctx.destination);

    return ctx;
  }

  async function resume() {
    ensureContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  async function setMusicEnabled(enabled) {
    ensureContext();

    if (enabled) {
      try {
        await resume();
      } catch (error) {
        console.warn("Sound Warriors audio resume failed", error);
      }

      musicOn = true;
      localStorage.setItem(STORAGE_KEY, "1");
      updateButton();
      playSfx("test");
      startLoop();
      return;
    }

    musicOn = false;
    localStorage.setItem(STORAGE_KEY, "0");
    updateButton();
    stopLoop();
  }

  function startLoop() {
    stopLoop();
    step = 0;
    playStep();
    loopTimer = window.setInterval(playStep, stepMs);
  }

  function stopLoop() {
    if (loopTimer) {
      window.clearInterval(loopTimer);
      loopTimer = null;
    }
  }

  function setMode(nextMode) {
    mode = nextMode === "battle" ? "battle" : "menu";
  }

  function playStep() {
    if (!musicOn || !ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;
    const pattern = mode === "battle" ? battlePattern : menuPattern;
    const note = pattern[step % pattern.length];

    if (step % 2 === 0) playKick(now);
    if (step % 4 === 2) playSnare(now);
    playHiHat(now);

    if (mode === "battle") {
      playBass(note / 2, now, 0.22);
      if (step % 2 === 1) playLead(note * 2, now, 0.16);
    } else {
      if (step % 2 === 0) playPad(note, now, 0.34);
      if (step % 2 === 1) playLead(note * 2, now, 0.15);
    }

    step += 1;
  }

  function osc(type, freq, time) {
    const node = ctx.createOscillator();
    node.type = type;
    node.frequency.setValueAtTime(freq, time);
    return node;
  }

  function gain(value, time) {
    const node = ctx.createGain();
    node.gain.setValueAtTime(Math.max(value, 0.0001), time);
    return node;
  }

  function playKick(time) {
    const o = osc("sine", 145, time);
    const g = gain(1.0, time);
    o.frequency.exponentialRampToValueAtTime(48, time + 0.13);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    o.connect(g).connect(musicGain);
    o.start(time);
    o.stop(time + 0.2);
  }

  function playSnare(time) {
    const duration = 0.11;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1100;

    const g = gain(0.42, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter).connect(g).connect(musicGain);
    noise.start(time);
    noise.stop(time + duration);
  }

  function playHiHat(time) {
    const duration = 0.045;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 5000;

    const g = gain(mode === "battle" ? 0.20 : 0.14, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter).connect(g).connect(musicGain);
    noise.start(time);
    noise.stop(time + duration);
  }

  function playBass(freq, time, duration) {
    const o = osc("sawtooth", freq, time);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;

    const g = gain(0.30, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);

    o.connect(filter).connect(g).connect(musicGain);
    o.start(time);
    o.stop(time + duration + 0.03);
  }

  function playPad(freq, time, duration) {
    const o1 = osc("triangle", freq, time);
    const o2 = osc("sine", freq * 1.5, time);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;

    const g = gain(0.18, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);

    o1.connect(filter);
    o2.connect(filter);
    filter.connect(g).connect(musicGain);
    o1.start(time);
    o2.start(time);
    o1.stop(time + duration + 0.03);
    o2.stop(time + duration + 0.03);
  }

  function playLead(freq, time, duration) {
    const o = osc("square", freq, time);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;

    const g = gain(mode === "battle" ? 0.18 : 0.14, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);

    o.connect(filter).connect(g).connect(musicGain);
    o.start(time);
    o.stop(time + duration + 0.02);
  }

  function playSfx(name) {
    ensureContext();
    resume().then(() => {
      const now = ctx.currentTime;

      if (name === "test") {
        [392, 523.25, 659.25, 783.99].forEach((freq, index) => {
          playFxTone(freq, now + index * 0.08, 0.18, "triangle", 0.30);
        });
        return;
      }

      if (name === "correct") {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
          playFxTone(freq, now + index * 0.045, 0.13, "triangle", 0.28);
        });
        return;
      }

      if (name === "wrong") {
        [260, 220, 185].forEach((freq, index) => {
          playFxTone(freq, now + index * 0.06, 0.15, "sawtooth", 0.18);
        });
        return;
      }

      if (name === "card") {
        [660, 880, 1320, 1760].forEach((freq, index) => {
          playFxTone(freq, now + index * 0.07, 0.22, "sine", 0.22);
        });
        return;
      }

      [392, 523.25, 659.25].forEach((freq, index) => {
        playFxTone(freq, now + index * 0.08, 0.18, "triangle", 0.22);
      });
    });
  }

  function playFxTone(freq, time, duration, type, volume) {
    const o = osc(type, freq, time);
    const g = gain(volume, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);
    o.connect(g).connect(fxGain);
    o.start(time);
    o.stop(time + duration + 0.03);
  }

  function updateButton() {
    const button = document.querySelector("#musicToggle");
    if (!button) return;

    button.classList.toggle("is-on", musicOn);
    button.setAttribute("aria-pressed", musicOn ? "true" : "false");

    const meter = '<span class="audio-meter" aria-hidden="true"><i></i><i></i><i></i></span>';
    button.innerHTML = `${musicOn ? meter : "♪"} ${musicOn ? "Música ON" : "Música"}`;
  }

  function init() {
    musicOn = false;
    updateButton();

    const musicToggle = document.querySelector("#musicToggle");
    if (musicToggle) {
      musicToggle.addEventListener("click", () => setMusicEnabled(!musicOn));
    }

    const opening = document.querySelector("#openingStage");
    const enterWithMusic = document.querySelector("#enterWithMusic");
    const enterSilent = document.querySelector("#enterSilent");

    const closeOpening = async (withMusic) => {
      if (withMusic) {
        await setMusicEnabled(true);
      } else {
        await resume();
        playSfx("open");
      }

      if (opening) {
        opening.classList.add("is-hidden");
        window.setTimeout(() => opening.remove(), 520);
      }
    };

    if (enterWithMusic) enterWithMusic.addEventListener("click", () => closeOpening(true));
    if (enterSilent) enterSilent.addEventListener("click", () => closeOpening(false));
  }

  window.SW_AUDIO = {
    enabled: () => musicOn,
    setMusicEnabled,
    toggle: () => setMusicEnabled(!musicOn),
    setMode,
    playSfx,
    init
  };
})();
