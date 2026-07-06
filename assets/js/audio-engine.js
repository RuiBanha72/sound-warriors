(() => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    window.SW_AUDIO = createSilentAudioApi();
    return;
  }

  let ctx = null;
  let master = null;
  let musicGain = null;
  let fxGain = null;
  let stepTimer = null;
  let step = 0;
  let musicOn = false;
  let mode = "menu";

  const STORAGE_KEY = "sound-warriors-audio-enabled";
  const bpm = 112;
  const stepMs = (60_000 / bpm) / 2;

  const scales = {
    menu: [261.63, 311.13, 392.00, 466.16, 523.25, 622.25, 783.99, 932.33],
    battle: [220.00, 261.63, 329.63, 392.00, 440.00, 523.25, 659.25, 784.00],
    victory: [329.63, 392.00, 493.88, 659.25, 783.99]
  };

  function ensureContext() {
    if (ctx) return ctx;

    ctx = new AudioContextClass();
    master = ctx.createGain();
    musicGain = ctx.createGain();
    fxGain = ctx.createGain();

    master.gain.value = 0.72;
    musicGain.gain.value = 0.24;
    fxGain.gain.value = 0.62;

    musicGain.connect(master);
    fxGain.connect(master);
    master.connect(ctx.destination);

    return ctx;
  }

  function setMusicEnabled(enabled) {
    ensureContext();
    musicOn = Boolean(enabled);
    localStorage.setItem(STORAGE_KEY, musicOn ? "1" : "0");
    updateButton();

    if (musicOn) {
      resume().then(() => {
        startLoop();
        playSfx("open");
      });
    } else {
      stopLoop();
    }
  }

  function resume() {
    ensureContext();
    return ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
  }

  function startLoop() {
    if (stepTimer) return;
    step = 0;
    tick();
    stepTimer = window.setInterval(tick, stepMs);
  }

  function stopLoop() {
    if (stepTimer) {
      window.clearInterval(stepTimer);
      stepTimer = null;
    }
  }

  function setMode(nextMode) {
    mode = nextMode || "menu";
  }

  function tick() {
    if (!musicOn || !ctx) return;

    const now = ctx.currentTime;
    const scale = scales[mode] || scales.menu;
    const progression = mode === "battle"
      ? [0, 0, 3, 0, 4, 4, 3, 4, 0, 0, 3, 0, 5, 4, 3, 1]
      : [0, 2, 4, 2, 5, 4, 2, 0, 3, 5, 4, 2, 0, 2, 4, 7];

    const root = progression[step % progression.length];

    if (step % 2 === 0) {
      playKick(now);
    }

    if (step % 4 === 2) {
      playSnare(now);
    }

    if (step % 1 === 0) {
      playHat(now);
    }

    if (step % 4 === 0) {
      playBass(scale[root % scale.length] / 2, now, 0.18);
    }

    if (step % 2 === 1) {
      const note = scale[(root + (mode === "battle" ? 4 : 2)) % scale.length];
      playPluck(note, now, 0.12);
    }

    if (step % 8 === 7) {
      const note = scale[(root + 7) % scale.length] * 2;
      playSparkle(note, now, 0.10);
    }

    step += 1;
  }

  function makeOsc(type, freq, time) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    return osc;
  }

  function makeGain(value, time) {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(value, time);
    return gain;
  }

  function playKick(time) {
    const osc = makeOsc("sine", 120, time);
    const gain = makeGain(0.8, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    osc.connect(gain).connect(musicGain);
    osc.start(time);
    osc.stop(time + 0.18);
  }

  function playSnare(time) {
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1300;
    const gain = makeGain(0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    noise.connect(filter).connect(gain).connect(musicGain);
    noise.start(time);
    noise.stop(time + 0.1);
  }

  function playHat(time) {
    const bufferSize = ctx.sampleRate * 0.035;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 5600;
    const gain = makeGain(mode === "battle" ? 0.10 : 0.065, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
    noise.connect(filter).connect(gain).connect(musicGain);
    noise.start(time);
    noise.stop(time + 0.05);
  }

  function playBass(freq, time, duration) {
    const osc = makeOsc("sawtooth", freq, time);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(360, time);
    const gain = makeGain(mode === "battle" ? 0.16 : 0.10, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(filter).connect(gain).connect(musicGain);
    osc.start(time);
    osc.stop(time + duration + 0.03);
  }

  function playPluck(freq, time, duration) {
    const osc = makeOsc("triangle", freq, time);
    const gain = makeGain(mode === "battle" ? 0.11 : 0.075, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain).connect(musicGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  function playSparkle(freq, time, duration) {
    const osc = makeOsc("sine", freq, time);
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.08;
    const gain = makeGain(0.085, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain).connect(musicGain);
    osc.connect(delay).connect(gain);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  function playSfx(name) {
    ensureContext();
    resume();
    const now = ctx.currentTime;

    if (name === "correct") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
        playFxTone(freq, now + index * 0.045, 0.12, "triangle", 0.18);
      });
      return;
    }

    if (name === "wrong") {
      [260, 220, 185].forEach((freq, index) => {
        playFxTone(freq, now + index * 0.055, 0.12, "sawtooth", 0.09);
      });
      return;
    }

    if (name === "card") {
      [660, 880, 1320].forEach((freq, index) => {
        playFxTone(freq, now + index * 0.07, 0.18, "sine", 0.13);
      });
      return;
    }

    if (name === "open") {
      [392, 523.25, 659.25].forEach((freq, index) => {
        playFxTone(freq, now + index * 0.08, 0.22, "triangle", 0.12);
      });
      return;
    }

    playFxTone(520, now, 0.08, "sine", 0.08);
  }

  function playFxTone(freq, time, duration, type, volume) {
    const osc = makeOsc(type, freq, time);
    const gain = makeGain(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain).connect(fxGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  function updateButton() {
    const button = document.querySelector("#musicToggle");
    if (!button) return;
    button.classList.toggle("is-on", musicOn);
    button.setAttribute("aria-pressed", musicOn ? "true" : "false");
    const meter = '<span class="audio-meter" aria-hidden="true"><i></i><i></i><i></i></span>';
    button.innerHTML = `${musicOn ? meter : "♪"} ${musicOn ? "Música ON" : "Música"}`;
  }

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

  function init() {
    const stored = localStorage.getItem(STORAGE_KEY) === "1";
    musicOn = false;
    updateButton();

    const musicToggle = document.querySelector("#musicToggle");
    if (musicToggle) {
      musicToggle.addEventListener("click", () => setMusicEnabled(!musicOn));
    }

    const opening = document.querySelector("#openingStage");
    const enterWithMusic = document.querySelector("#enterWithMusic");
    const enterSilent = document.querySelector("#enterSilent");

    const closeOpening = (withMusic) => {
      if (withMusic) setMusicEnabled(true);
      else if (stored) setMusicEnabled(true);
      else updateButton();

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
