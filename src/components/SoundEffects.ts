// Web Audio API Synthesizer for Retro Math Game sound effects

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleMute(muteState?: boolean): boolean {
  if (muteState !== undefined) {
    isMuted = muteState;
  } else {
    isMuted = !isMuted;
  }
  return isMuted;
}

export function getMuteState(): boolean {
  return isMuted;
}

// 1. Correct Answer: Bright double-chime (Major 3rd / 5th interval)
export function playCorrect() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sweet triangle wave for retro chime
    osc1.type = 'sine';
    osc2.type = 'triangle';

    // F4 (approx 349Hz) and A4 (approx 440Hz) -> then C5 (523Hz)
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc2.frequency.setValueAtTime(659.25, now); // E5

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // Make the second note start slightly later
    setTimeout(() => {
      if (isMuted) return;
      try {
        const o3 = ctx.createOscillator();
        const g3 = ctx.createGain();
        o3.connect(g3);
        g3.connect(ctx.destination);
        o3.type = 'sine';
        o3.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
        g3.gain.setValueAtTime(0, ctx.currentTime);
        g3.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
        g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        o3.start();
        o3.stop(ctx.currentTime + 0.4);
      } catch (e) {
        // Safe fail
      }
    }, 80);

    osc1.start();
    osc2.start();
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  } catch (e) {
    // Suppress web audio errors
  }
}

// 2. Incorrect Answer: Low buzz
export function playIncorrect() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.25);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start();
    osc.stop(now + 0.3);
  } catch (e) {}
}

// 3. Selection/Click: Soft pop
export function playSelect() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.start();
    osc.stop(now + 0.1);
  } catch (e) {}
}

// 4. Tick Countdown: High bubble pop for quick ticks
export function playTick() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);

    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.start();
    osc.stop(now + 0.04);
  } catch (e) {}
}

// 5. Combo Level-Up Chime
export function playCombo(comboCount: number) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'triangle';
    // Ascending frequency depending on combo (Max 15)
    const baseFreq = 523.25; // C5
    const step = Math.min(comboCount, 10) * 1.0594; // Semitone approx multiplication
    const freq = baseFreq * step;

    osc.frequency.setValueAtTime(freq, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.start();
    osc.stop(now + 0.22);
  } catch (e) {}
}

// 6. Victory Chord: Ascending full major arpeggio
export function playVictory() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    const duration = 0.8;

    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (isMuted) return;
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {}
      }, idx * 80);
    });
  } catch (e) {}
}

// 7. Game Over sound with falling pitch
export function playGameOver() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(196, now + 0.15); // G3
    osc.frequency.setValueAtTime(164.81, now + 0.3); // E3
    osc.frequency.setValueAtTime(130.81, now + 0.45); // C3
    osc.frequency.linearRampToValueAtTime(60, now + 0.8);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.start();
    osc.stop(now + 1.0);
  } catch (e) {}
}
