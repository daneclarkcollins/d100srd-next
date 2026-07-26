'use client';

/**
 * Dice-roll sound (Mike's Tavern Issues wishlist, 2026-07-25: "Rolling dice
 * makes noise"). Synthesized with the Web Audio API — a short clatter of
 * filtered noise bursts, no audio files to download. Muted/unmuted via a
 * persisted preference; defaults ON.
 */

const PREF_KEY = 'sagaborn-dice-sound';

let ctx: AudioContext | null = null;

export function diceSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PREF_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setDiceSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(PREF_KEY, on ? 'on' : 'off');
  } catch { /* private mode etc. — nonfatal */ }
}

/** Play a short dice-clatter. Safe to call anywhere; no-ops when muted or unsupported. */
export function playDiceSound(): void {
  if (!diceSoundEnabled()) return;
  try {
    type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
    const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();

    const now = ctx.currentTime;
    // A slower, longer tumble: clicks start quick, then the gaps stretch as
    // the dice settle (~0.8s total), with an exponential volume taper.
    const clicks = 8 + Math.floor(Math.random() * 3);
    let t = now + 0.01;
    for (let i = 0; i < clicks; i++) {
      const dur = 0.02 + Math.random() * 0.025;

      const frames = Math.max(1, Math.ceil(ctx.sampleRate * dur));
      const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < frames; j++) {
        data[j] = (Math.random() * 2 - 1) * (1 - j / frames); // decaying noise
      }

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400 + Math.random() * 2400; // plasticky click range
      filter.Q.value = 1.4;

      const gain = ctx.createGain();
      // Exponential fade — late clicks are the dice barely rocking to rest
      gain.gain.value = (0.24 + Math.random() * 0.16) * Math.pow(0.8, i);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t);

      // Gaps widen as the tumble loses energy (decelerating rhythm)
      t += (0.05 + Math.random() * 0.02) * Math.pow(1.22, i);
    }
  } catch { /* audio unavailable — silently skip */ }
}
