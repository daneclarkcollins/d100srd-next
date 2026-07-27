'use client';

/**
 * Dice-roll sound. Plays Mike's recorded dice clip
 * (public/sounds/dice-roll.mp3, supplied 2026-07-26) on every roll.
 * Muted/unmuted via a persisted preference; defaults ON.
 *
 * (The previous version synthesized a clatter with the Web Audio API — if
 * the recorded clip ever needs replacing, that implementation is in git
 * history at commit c593513.)
 */

const PREF_KEY = 'sagaborn-dice-sound';
const SOUND_URL = '/sounds/dice-roll.mp3';

let base: HTMLAudioElement | null = null;

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

/** Play the dice sound. Safe to call anywhere; no-ops when muted or unsupported. */
export function playDiceSound(): void {
  if (!diceSoundEnabled()) return;
  try {
    base ??= new Audio(SOUND_URL);
    // Clone so rapid rolls can overlap instead of restarting one element
    const a = base.cloneNode() as HTMLAudioElement;
    a.volume = 0.65;
    void a.play().catch(() => { /* autoplay blocked until first interaction — fine */ });
  } catch { /* audio unavailable — silently skip */ }
}
