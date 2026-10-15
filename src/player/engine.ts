// Placeholder beat for tracks with no audio file: an afrobeats-style 16-step loop
// (kick, shaker, clap, log drum, chord stabs) at the track's BPM and key, scheduled 120ms ahead.
const NOTE: Record<string, number> = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
const rootHz = (key: string) => 55 * Math.pow(2, (NOTE[key.replace("m", "")] ?? 9) / 12 + 1); // octave 2–3 range
const AHEAD = 0.12;

export class BeatEngine {
  readonly duration = 96;
  private ctx?: AudioContext;
  private master!: GainNode;
  private noise!: AudioBuffer;
  private timer?: number;
  private t0 = 0;          // ctx time at which position 0 would have started
  private nextStep = 0;    // absolute step index to schedule next
  private bpm = 100;
  private root = 110;
  private paused = 0;
  private running = false;
  private volume = 0.8;
  private muted = false;

  private ensure() {
    if (this.ctx) return;
    const ctx = (this.ctx = new AudioContext());
    this.master = ctx.createGain();
    this.master.gain.value = this.volume * 0.6;
    this.master.connect(ctx.destination);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  get position() {
    return this.running && this.ctx ? Math.min(this.duration, this.ctx.currentTime - this.t0) : this.paused;
  }

  start(bpm: number, key: string, offset = 0) {
    this.ensure();
    const ctx = this.ctx!;
    void ctx.resume();
    this.bpm = bpm; this.root = rootHz(key);
    this.t0 = ctx.currentTime - offset;
    this.nextStep = Math.ceil(offset / this.stepLen());
    this.running = true;
    clearInterval(this.timer);
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  stop() {
    if (this.running) this.paused = this.position;
    this.running = false;
    clearInterval(this.timer);
  }

  reset(pos = 0) { this.stop(); this.paused = pos; }

  setVolume(v: number) { this.volume = v; this.applyGain(); }
  setMuted(m: boolean) { this.muted = m; this.applyGain(); }
  private applyGain() { if (this.master) this.master.gain.value = this.muted ? 0 : this.volume * 0.6; }

  private stepLen() { return 60 / this.bpm / 4; }

  private schedule() {
    const ctx = this.ctx!;
    const len = this.stepLen();
    while (this.t0 + this.nextStep * len < ctx.currentTime + AHEAD) {
      const t = this.t0 + this.nextStep * len;
      if (t >= this.t0 + this.duration) { this.stop(); return; }
      if (t >= ctx.currentTime - 0.05) this.hit(this.nextStep % 16, Math.floor(this.nextStep / 16), t);
      this.nextStep++;
    }
  }

  private hit(s: number, bar: number, t: number) {
    if ([0, 6, 10].includes(s) || (s === 14 && bar % 2)) this.kick(t);
    if (s === 4 || s === 12) this.clap(t);
    this.shaker(t, s % 2 ? 0.1 : 0.05);
    if ([3, 7, 11, 15].includes(s)) this.log(t, s % 8 === 7 ? this.root * 1.5 : this.root * (bar % 4 === 3 ? 1.2 : 1));
    if (s === 2 || s === 8 || (s === 13 && bar % 2)) this.stab(t);
  }

  private env(g: GainNode, t: number, peak: number, dur: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  private kick(t: number) {
    const o = this.ctx!.createOscillator(), g = this.ctx!.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    this.env(g, t, 0.9, 0.28);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.3);
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, peak: number, dur: number) {
    const src = this.ctx!.createBufferSource(), f = this.ctx!.createBiquadFilter(), g = this.ctx!.createGain();
    src.buffer = this.noise; f.type = type; f.frequency.value = freq;
    this.env(g, t, peak, dur);
    src.connect(f).connect(g).connect(this.master); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  }
  private shaker(t: number, v: number) { this.noiseHit(t, "highpass", 6500, v, 0.05); }
  private clap(t: number) { this.noiseHit(t, "bandpass", 1500, 0.4, 0.14); }

  private log(t: number, hz: number) {
    const o = this.ctx!.createOscillator(), g = this.ctx!.createGain();
    o.frequency.setValueAtTime(hz * 1.4, t); o.frequency.exponentialRampToValueAtTime(hz, t + 0.05);
    this.env(g, t, 0.55, 0.26);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.3);
  }

  private stab(t: number) {
    const lp = this.ctx!.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
    const g = this.ctx!.createGain(); this.env(g, t, 0.13, 0.22);
    lp.connect(g).connect(this.master);
    for (const r of [2, 2 * 1.189, 2 * 1.498]) { // root, minor third, fifth
      const o = this.ctx!.createOscillator(); o.type = "triangle"; o.frequency.value = this.root * r;
      o.connect(lp); o.start(t); o.stop(t + 0.25);
    }
  }
}
