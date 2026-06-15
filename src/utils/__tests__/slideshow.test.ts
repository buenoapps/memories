import {
  clampIndex,
  DEFAULT_SPEED_INDEX,
  nextIndex,
  prevIndex,
  SLIDESHOW_SPEEDS,
} from '@/utils/slideshow';

describe('nextIndex', () => {
  it('advances and wraps around to the start', () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(2, 3)).toBe(0);
  });

  it('stays at 0 for an empty list', () => {
    expect(nextIndex(0, 0)).toBe(0);
  });
});

describe('prevIndex', () => {
  it('steps back and wraps around to the end', () => {
    expect(prevIndex(1, 3)).toBe(0);
    expect(prevIndex(0, 3)).toBe(2);
  });
});

describe('clampIndex', () => {
  it('keeps the index within range', () => {
    expect(clampIndex(-5, 3)).toBe(0);
    expect(clampIndex(10, 3)).toBe(2);
    expect(clampIndex(1, 3)).toBe(1);
  });

  it('returns 0 for an empty list', () => {
    expect(clampIndex(2, 0)).toBe(0);
  });
});

describe('SLIDESHOW_SPEEDS', () => {
  it('exposes speeds and a valid default index', () => {
    expect(SLIDESHOW_SPEEDS.length).toBeGreaterThan(0);
    expect(SLIDESHOW_SPEEDS[DEFAULT_SPEED_INDEX]).toBeDefined();
  });
});
