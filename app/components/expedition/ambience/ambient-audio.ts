import type { ResolvedSound } from "@/lib/ambience/types";

export type AmbientAudioState = "idle" | "starting" | "on" | "blocked";

/**
 * A tiny synthesized soundscape. Nothing is fetched: birds, crickets, rain
 * and wind are generated with the Web Audio API, so the feature ships with
 * no audio assets and stays fully offline.
 *
 * The engine is a singleton owned by the ambience provider; it keeps one
 * AudioContext alive and rebuilds only the active preset's layer.
 */
export class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private layer: GainNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];
  private timers: number[] = [];
  private noise: AudioBuffer | null = null;
  private preset: ResolvedSound = null;
  private volume = 0.5;
  private stateCallback: ((state: AmbientAudioState) => void) | null = null;
  private generation = 0;
  private started = false;

  onStateChange(callback: ((state: AmbientAudioState) => void) | null) {
    this.stateCallback = callback;
  }

  private emit(state: AmbientAudioState) {
    this.stateCallback?.(state);
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      this.noise = this.createNoiseBuffer(this.ctx);
      this.ctx.addEventListener("statechange", () => {
        if (!this.ctx || !this.started || !this.preset) return;
        if (this.ctx.state === "running") {
          // Autoplay was blocked earlier: build the layer once a gesture unlocks it.
          this.setPreset(this.preset);
          this.emit("on");
        }
        if (this.ctx.state === "suspended") this.emit("blocked");
      });
    }
    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const seconds = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      // Soft pink-ish shaping reads better as rain/wind than white noise.
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    return buffer;
  }

  async start(preset: ResolvedSound, volume: number): Promise<AmbientAudioState> {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) {
      this.emit("blocked");
      return "blocked";
    }
    this.volume = volume;
    this.started = true;
    this.emit("starting");

    if (ctx.state === "suspended") {
      // Chrome keeps resume() pending until a gesture, so never await forever:
      // report "blocked" after a short grace period and let a gesture retry.
      try {
        await Promise.race([
          ctx.resume().catch(() => undefined),
          new Promise((resolve) => window.setTimeout(resolve, 700)),
        ]);
      } catch {
        // A browser can reject resume() without a gesture; reported below.
      }
    }

    if (ctx.state !== "running") {
      // Remember the request so a later gesture can build it in `resume()`.
      this.preset = preset;
      this.emit("blocked");
      return "blocked";
    }

    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(this.volume * 0.9, ctx.currentTime, 0.4);
    this.setPreset(preset);
    this.emit("on");
    return "on";
  }

  async resume(): Promise<boolean> {
    if (!this.ctx || !this.started) return false;
    try {
      await Promise.race([
        this.ctx.resume(),
        new Promise((resolve) => window.setTimeout(resolve, 700)),
      ]);
    } catch {
      return false;
    }
    if (this.ctx.state === "running") {
      if (this.preset) this.setPreset(this.preset);
      this.emit("on");
      return true;
    }
    return false;
  }

  setPreset(preset: ResolvedSound) {
    if (preset === this.preset && this.layer) return;
    this.preset = preset;
    this.teardownLayer();
    if (!this.ctx || !this.master || this.ctx.state !== "running") return;
    if (!preset) return;

    const ctx = this.ctx;
    const layer = ctx.createGain();
    layer.gain.value = 1;
    layer.connect(this.master);
    this.layer = layer;
    const token = this.generation;

    if (preset === "rain") this.buildRain(ctx, layer, token);
    if (preset === "wind") this.buildWind(ctx, layer, token);
    if (preset === "birds") {
      this.buildWind(ctx, layer, token, 0.16);
      this.scheduleBirdPhrase(token);
    }
    if (preset === "crickets") {
      this.buildWind(ctx, layer, token, 0.12);
      this.scheduleCricketBurst(token);
    }
  }

  setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume));
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(this.volume * 0.9, this.ctx.currentTime, 0.2);
  }

  stop() {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    this.teardownLayer();
    this.preset = null;
    this.emit("idle");
  }

  private teardownLayer() {
    this.generation += 1;
    for (const timer of this.timers) window.clearTimeout(timer);
    this.timers = [];
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
      source.disconnect();
    }
    this.sources = [];
    if (this.layer) {
      try {
        this.layer.disconnect();
      } catch {
        // Already disconnected.
      }
      this.layer = null;
    }
  }

  private track(source: AudioScheduledSourceNode) {
    this.sources.push(source);
  }

  private schedule(token: number, delayMs: number, run: () => void) {
    const timer = window.setTimeout(() => {
      if (token !== this.generation) return;
      run();
    }, delayMs);
    this.timers.push(timer);
  }

  private buildRain(ctx: AudioContext, out: GainNode, token: number) {
    if (!this.noise) return;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1400;
    bandpass.Q.value = 0.35;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2600;

    const gain = ctx.createGain();
    gain.gain.value = 0.22;

    // Slow swells make the rain feel alive instead of static.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(gain.gain);

    source.connect(bandpass).connect(lowpass).connect(gain).connect(out);
    source.start();
    lfo.start();
    this.track(source);
    this.track(lfo);

    // Occasional heavier drops.
    const drops = () => {
      if (token !== this.generation) return;
      this.rainDrop(ctx, out);
      this.schedule(token, 380 + Math.random() * 1600, drops);
    };
    this.schedule(token, 600, drops);
  }

  private rainDrop(ctx: AudioContext, out: GainNode) {
    const t0 = ctx.currentTime + 0.02;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(900 + Math.random() * 700, t0);
    osc.frequency.exponentialRampToValueAtTime(320, t0 + 0.07);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.035, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    osc.connect(gain).connect(pan).connect(out);
    osc.start(t0);
    osc.stop(t0 + 0.1);
  }

  private buildWind(ctx: AudioContext, out: GainNode, token: number, level = 0.16) {
    if (!this.noise) return;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 520;
    lowpass.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.value = level;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = level * 0.55;
    lfo.connect(lfoGain).connect(gain.gain);

    source.connect(lowpass).connect(gain).connect(out);
    source.start();
    lfo.start();
    this.track(source);
    this.track(lfo);

    // Keep the token referenced so the linter sees intent for future layers.
    void token;
  }

  private scheduleBirdPhrase(token: number) {
    this.schedule(token, 1600 + Math.random() * 3600, () => {
      const ctx = this.ctx;
      const out = this.layer;
      if (!ctx || !out) return;
      const t0 = ctx.currentTime + 0.05;
      const notes = 2 + Math.floor(Math.random() * 4);
      let cursor = 0;
      for (let i = 0; i < notes; i += 1) {
        this.birdNote(ctx, out, t0 + cursor, 1700 + Math.random() * 1500);
        cursor += 0.07 + Math.random() * 0.13;
      }
      this.scheduleBirdPhrase(token);
    });
  }

  private birdNote(ctx: AudioContext, out: GainNode, t0: number, base: number) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(base, t0);
    osc.frequency.exponentialRampToValueAtTime(base * 1.55, t0 + 0.045);
    osc.frequency.exponentialRampToValueAtTime(base * 1.15, t0 + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.11, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);

    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;

    osc.connect(gain).connect(pan).connect(out);
    osc.start(t0);
    osc.stop(t0 + 0.16);
  }

  private scheduleCricketBurst(token: number) {
    this.schedule(token, 500 + Math.random() * 1500, () => {
      const ctx = this.ctx;
      const out = this.layer;
      if (!ctx || !out) return;
      this.cricketBurst(ctx, out);
      this.scheduleCricketBurst(token);
    });
  }

  private cricketBurst(ctx: AudioContext, out: GainNode) {
    const t0 = ctx.currentTime + 0.03;
    const duration = 0.22 + Math.random() * 0.12;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 3700 + Math.random() * 900;

    // The fast tremolo is what turns a plain tone into a cricket chirp.
    const tremolo = ctx.createGain();
    tremolo.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 24 + Math.random() * 10;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.45;
    lfo.connect(lfoGain).connect(tremolo.gain);

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, t0);
    envelope.gain.linearRampToValueAtTime(0.14, t0 + 0.015);
    envelope.gain.setValueAtTime(0.14, t0 + duration - 0.04);
    envelope.gain.linearRampToValueAtTime(0, t0 + duration);

    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;

    osc.connect(tremolo).connect(envelope).connect(pan).connect(out);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
    lfo.start(t0);
    lfo.stop(t0 + duration + 0.02);
  }

  dispose() {
    this.teardownLayer();
    this.started = false;
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.master = null;
    }
    this.preset = null;
    this.emit("idle");
  }
}
