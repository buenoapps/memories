/**
 * Pure helpers for the slideshow ("Diashow") mode. Kept free of React so the
 * timing and wrap-around logic can be unit tested in isolation.
 */

/** A selectable playback speed for the slideshow. */
export type SlideshowSpeed = {
  /** Translation key for the speed's label, resolved by the UI. */
  labelKey: string;
  /** Milliseconds each slide stays on screen. */
  intervalMs: number;
};

/** The speeds offered in the slideshow controls, slowest to fastest. */
export const SLIDESHOW_SPEEDS: SlideshowSpeed[] = [
  { labelKey: 'slideshow.speedSlow', intervalMs: 6000 },
  { labelKey: 'slideshow.speedNormal', intervalMs: 4000 },
  { labelKey: 'slideshow.speedFast', intervalMs: 2000 },
];

/** Index of the default ("Normal") speed. */
export const DEFAULT_SPEED_INDEX = 1;

/** Returns the next slide index, wrapping back to the start at the end. */
export function nextIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}

/** Returns the previous slide index, wrapping around to the end. */
export function prevIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current - 1 + length) % length;
}

/** Clamps an index into the valid range for a list of the given length. */
export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}
