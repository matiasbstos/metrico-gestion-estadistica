/**
 * Audio Feedback Synthesizer para MÉTRICO
 * Genera tonos armónicos profesionales y agradables mediante Web Audio API
 * sin dependencias externas, sin latencia de red y con soporte offline total.
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Sonido Armónico de Inicio de Sesión (Chime Ascendente Suave - 3 Notas)
   * Tonalidad C Mayor: C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz) + C6 (1046.50 Hz)
   */
  playLoginSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.25 }, // C5
        { freq: 659.25, time: 0.08, dur: 0.28 }, // E5
        { freq: 783.99, time: 0.16, dur: 0.32 }, // G5
        { freq: 1046.50, time: 0.24, dur: 0.50 } // C6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Curva de volumen suave (ataque rápido y decaimiento exponencial)
        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.exponentialRampToValueAtTime(0.12, now + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch (e) {
      console.warn("Audio feedback notice:", e);
    }
  }

  /**
   * Sonido Seguro de Cierre de Sesión (Tono Descendente Suave)
   * A4 (440 Hz) -> E4 (329.63 Hz) -> A3 (220 Hz)
   */
  playLogoutSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [
        { freq: 587.33, time: 0.00, dur: 0.20 }, // D5
        { freq: 440.00, time: 0.09, dur: 0.24 }, // A4
        { freq: 329.63, time: 0.18, dur: 0.40 }  // E4
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.exponentialRampToValueAtTime(0.09, now + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch (e) {
      console.warn("Audio feedback notice:", e);
    }
  }
}

export const soundEffects = new SoundEffects();
