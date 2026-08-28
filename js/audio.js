window.GameAudio = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  tone(freq, type, duration, volume, delay) {
    const ac = this.ctx;
    const t = ac.currentTime + (delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + duration);
  },

  eat() {
    this.init();
    this.tone(880, "sine", 0.08, 0.18, 0);
    this.tone(1320, "sine", 0.08, 0.13, 0.05);
  },

  frenzyEat() {
    this.init();
    this.tone(880, "sine", 0.06, 0.16, 0);
    this.tone(1100, "sine", 0.06, 0.14, 0.05);
    this.tone(1400, "sine", 0.1, 0.12, 0.1);
  },

  gameOver() {
    this.init();
    this.tone(440, "square", 0.15, 0.16, 0);
    this.tone(330, "square", 0.15, 0.16, 0.14);
    this.tone(220, "sawtooth", 0.4, 0.14, 0.28);
  },

  eventFrenzy() {
    this.init();
    this.tone(660, "sine", 0.08, 0.14, 0);
    this.tone(880, "sine", 0.08, 0.14, 0.08);
    this.tone(1100, "sine", 0.14, 0.12, 0.16);
  },

  eventMine() {
    this.init();
    this.tone(330, "sawtooth", 0.12, 0.12, 0);
    this.tone(290, "sawtooth", 0.12, 0.12, 0.1);
    this.tone(250, "sawtooth", 0.2, 0.1, 0.2);
  },

  buy() {
    this.init();
    this.tone(523, "sine", 0.08, 0.16, 0);
    this.tone(659, "sine", 0.08, 0.16, 0.07);
    this.tone(784, "sine", 0.14, 0.14, 0.14);
  },

  equip() {
    this.init();
    this.tone(700, "sine", 0.1, 0.12, 0);
  },

  revive() {
    this.init();
    this.tone(440, "sine", 0.1, 0.14, 0);
    this.tone(550, "sine", 0.1, 0.14, 0.08);
    this.tone(660, "sine", 0.1, 0.14, 0.16);
    this.tone(880, "sine", 0.16, 0.12, 0.24);
  },
};

