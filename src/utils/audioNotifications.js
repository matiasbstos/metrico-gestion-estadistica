// Sintetizador nativo de Audio usando Web Audio API (Sin archivos mp3 externos)
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playSuccessChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tono 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tono 2: E5 (659.25 Hz) - Ascendente suave a los 120ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.12);
    gain2.gain.setValueAtTime(0.1, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn("Audio Context sound blocked or not supported:", err);
  }
};

export const playErrorChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tono 1: 440 Hz (A4)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tono 2: 330 Hz (E4) - Descendente de advertencia a los 150ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(330, now + 0.15);
    gain2.gain.setValueAtTime(0.14, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.warn("Audio Context sound blocked or not supported:", err);
  }
};

// Chime distintivo de Alerta de Incidentes / Discrepancias de Integridad (Doble pulso de frecuencia clínica)
export const playIntegrityAlertChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Pulso 1 (t=0ms): F5 (698.46 Hz) + C6 (1046.5 Hz) - Tono de advertencia inicial
    const osc1a = ctx.createOscillator();
    const osc1b = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1a.type = 'sine';
    osc1a.frequency.setValueAtTime(698.46, now);
    osc1b.type = 'triangle';
    osc1b.frequency.setValueAtTime(1046.5, now);

    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc1a.connect(gain1);
    osc1b.connect(gain1);
    gain1.connect(ctx.destination);

    osc1a.start(now);
    osc1b.start(now);
    osc1a.stop(now + 0.16);
    osc1b.stop(now + 0.16);

    // Pulso 2 (t=140ms): A5 (880 Hz) + F6 (1396.91 Hz) - Notificación distintiva de incidente
    const osc2a = ctx.createOscillator();
    const osc2b = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2a.type = 'sine';
    osc2a.frequency.setValueAtTime(880, now + 0.14);
    osc2b.type = 'sine';
    osc2b.frequency.setValueAtTime(1396.91, now + 0.14);

    gain2.gain.setValueAtTime(0.1, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc2a.connect(gain2);
    osc2b.connect(gain2);
    gain2.connect(ctx.destination);

    osc2a.start(now + 0.14);
    osc2b.start(now + 0.14);
    osc2a.stop(now + 0.42);
    osc2b.stop(now + 0.42);
  } catch (err) {
    console.warn("Audio Context sound blocked or not supported:", err);
  }
};

// Chime distintivo de Limpieza / Purga de Notificaciones (Barrido armónico cristalino D5 -> A5 -> D6)
export const playClearChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Pulso 1 (t=0ms): D5 (587.33 Hz) - Nota base de limpieza
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Pulso 2 (t=80ms): D6 (1174.66 Hz) - Chime cristalino ascendente de confirmación
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.08);
    gain2.gain.setValueAtTime(0.09, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.38);
  } catch (err) {
    console.warn("Audio Context sound blocked or not supported:", err);
  }
};

// Chime distintivo de Finalización de Sincronización de Base de Datos (Acorde armónico futurista 3 fases: C5/G5 -> E5/C6 -> G5/E6)
export const playSyncCompleteChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fase 1 (t=0ms): C5 (523.25 Hz) + G5 (783.99 Hz)
    const osc1a = ctx.createOscillator();
    const osc1b = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1a.type = 'sine';
    osc1a.frequency.setValueAtTime(523.25, now);
    osc1b.type = 'sine';
    osc1b.frequency.setValueAtTime(783.99, now);

    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1a.connect(gain1);
    osc1b.connect(gain1);
    gain1.connect(ctx.destination);

    osc1a.start(now);
    osc1b.start(now);
    osc1a.stop(now + 0.25);
    osc1b.stop(now + 0.25);

    // Fase 2 (t=90ms): E5 (659.25 Hz) + C6 (1046.50 Hz)
    const osc2a = ctx.createOscillator();
    const osc2b = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2a.type = 'sine';
    osc2a.frequency.setValueAtTime(659.25, now + 0.09);
    osc2b.type = 'sine';
    osc2b.frequency.setValueAtTime(1046.50, now + 0.09);

    gain2.gain.setValueAtTime(0.08, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc2a.connect(gain2);
    osc2b.connect(gain2);
    gain2.connect(ctx.destination);

    osc2a.start(now + 0.09);
    osc2b.start(now + 0.09);
    osc2a.stop(now + 0.38);
    osc2b.stop(now + 0.38);

    // Fase 3 (t=200ms): G5 (783.99 Hz) + E6 (1318.51 Hz) - Resonancia brillante de alta definición
    const osc3a = ctx.createOscillator();
    const osc3b = ctx.createOscillator();
    const gain3 = ctx.createGain();

    osc3a.type = 'sine';
    osc3a.frequency.setValueAtTime(783.99, now + 0.20);
    osc3b.type = 'sine';
    osc3b.frequency.setValueAtTime(1318.51, now + 0.20);

    gain3.gain.setValueAtTime(0.09, now + 0.20);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc3a.connect(gain3);
    osc3b.connect(gain3);
    gain3.connect(ctx.destination);

    osc3a.start(now + 0.20);
    osc3b.start(now + 0.20);
    osc3a.stop(now + 0.65);
    osc3b.stop(now + 0.65);
  } catch (err) {
    console.warn("Audio Context sound blocked or not supported:", err);
  }
};

// Chime suave de Auto-Sincronización Silenciosa (Doble pulso tenue F5 -> C6)
export const playAutoSyncChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Pulso 1 (t=0ms): F5 (698.46 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0.04, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Pulso 2 (t=110ms): C6 (1046.5 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.11);
    gain2.gain.setValueAtTime(0.05, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.11);
    osc2.stop(now + 0.4);
  } catch (err) {
    console.warn("Audio Context sound blocked or not supported:", err);
  }
};
