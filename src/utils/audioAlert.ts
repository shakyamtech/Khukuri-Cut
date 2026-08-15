// High-End 3-Tone Hotel Reception Bell Chime & Cross-Tab BroadcastChannel System

export const APPOINTMENT_EVENT_CREATED = 'kc_appointment_created';
export const APPOINTMENT_EVENT_UPDATED = 'kc_appointment_updated';

// Cross-tab communication channel so Admin tab receives notification even when booking happens on Customer tab
export const adminChannel =
  typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('kc_barber_admin_channel')
    : null;

export const notifyNewBookingCrossTab = (appointmentData: any) => {
  try {
    if (adminChannel) {
      adminChannel.postMessage({
        type: 'NEW_BOOKING',
        appointment: appointmentData,
        timestamp: Date.now(),
      });
    }
  } catch (e) {
    console.error('Error broadcasting booking across tabs', e);
  }
};

// Global shared AudioContext to prevent suspension issues
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch (e) {
    console.error('Error initializing AudioContext', e);
    return null;
  }
}

// Unlock audio on first user click anywhere on page
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

export const playSweetDingSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Master Volume & Compressor to make the bell chime rich, punchy, and loud
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, now);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, now);
    compressor.knee.setValueAtTime(30, now);
    compressor.ratio.setValueAtTime(12, now);

    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // --- Tone 1: High Bell Strike (E6 = 1318.51 Hz) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.7, now + 0.012);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(masterGain);

    // --- Tone 2: Warm Overtone (G6 = 1567.98 Hz, 80ms delay for "Ding-Dong" chime) ---
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.65, now + 0.092);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    // --- Tone 3: High Crystal Shimmer (E7 = 2637.02 Hz, 140ms delay) ---
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(2637.02, now + 0.14);
    gain3.gain.setValueAtTime(0.001, now + 0.14);
    gain3.gain.linearRampToValueAtTime(0.45, now + 0.152);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    osc3.connect(gain3);
    gain3.connect(masterGain);

    // Play all tones
    osc1.start(now);
    osc1.stop(now + 1.25);

    osc2.start(now + 0.08);
    osc2.stop(now + 1.55);

    osc3.start(now + 0.14);
    osc3.stop(now + 1.85);
  } catch (e) {
    console.error('Error playing bell chime sound', e);
  }
};
