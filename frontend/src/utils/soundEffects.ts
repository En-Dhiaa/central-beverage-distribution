// HTML5 Web Audio Synthesizer for offline system audio feedback
class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const pref = localStorage.getItem('beverage_sound_enabled');
    return pref === null || pref === 'true';
  }

  private getVolume(): number {
    if (typeof window === 'undefined') return 0.7;
    const volStr = localStorage.getItem('beverage_sound_volume');
    const vol = volStr ? parseFloat(volStr) : 70;
    return Math.min(Math.max(vol / 100, 0), 1) * 0.4; // Max gain scaled to pleasant 0.4
  }

  playSuccess() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const masterVol = this.getVolume();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(masterVol, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {
      // Audio error suppressed
    }
  }

  playCash() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const oscBell = ctx.createOscillator();
      const gain = ctx.createGain();

      const masterVol = this.getVolume();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(masterVol * 1.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      // Register bell chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

      oscBell.type = 'triangle';
      oscBell.frequency.setValueAtTime(1975.53, now + 0.05); // B6
      oscBell.frequency.exponentialRampToValueAtTime(2637.02, now + 0.2);

      osc.connect(gain);
      oscBell.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscBell.start(now + 0.05);
      osc.stop(now + 0.45);
      oscBell.stop(now + 0.45);
    } catch (e) {}
  }

  playWarning() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const masterVol = this.getVolume();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(masterVol * 0.8, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.linearRampToValueAtTime(349.23, now + 0.25); // F4

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playError() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const masterVol = this.getVolume();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(masterVol, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(146.83, now + 0.3); // D3

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playPop() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const masterVol = this.getVolume();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(masterVol * 0.6, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }
}

export const sounds = new SoundSynthesizer();

