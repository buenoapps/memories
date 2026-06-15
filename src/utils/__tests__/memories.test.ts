import {
  buildYears,
  dayRange,
  formatDayLabel,
  formatPercent,
  photoCountLabel,
  YEARS_BACK,
  yearsAgoLabel,
} from '@/utils/memories';

describe('buildYears', () => {
  it('starts with the current year (yearsAgo 0) and walks back', () => {
    const years = buildYears(new Date(2026, 5, 15), 3);
    expect(years).toEqual([
      { year: 2026, yearsAgo: 0 },
      { year: 2025, yearsAgo: 1 },
      { year: 2024, yearsAgo: 2 },
      { year: 2023, yearsAgo: 3 },
    ]);
  });

  it('returns yearsBack + 1 entries and defaults to YEARS_BACK', () => {
    expect(buildYears(new Date(2026, 0, 1), 10)).toHaveLength(11);
    expect(buildYears(new Date(2026, 0, 1))).toHaveLength(YEARS_BACK + 1);
  });
});

describe('dayRange', () => {
  it('spans a full calendar day in epoch milliseconds', () => {
    const { start, end } = dayRange(2024, 5, 15);
    expect(start).toBe(new Date(2024, 5, 15, 0, 0, 0, 0).getTime());
    expect(end - start).toBe(24 * 60 * 60 * 1000 - 1);
  });
});

describe('yearsAgoLabel', () => {
  it.each([
    [0, 'Today'],
    [-1, 'Today'],
    [1, '1 year ago'],
    [2, '2 years ago'],
    [50, '50 years ago'],
  ])('maps %s to "%s"', (input, expected) => {
    expect(yearsAgoLabel(input)).toBe(expected);
  });
});

describe('photoCountLabel', () => {
  it('pluralises correctly', () => {
    expect(photoCountLabel(0)).toBe('0 photos');
    expect(photoCountLabel(1)).toBe('1 photo');
    expect(photoCountLabel(5)).toBe('5 photos');
  });
});

describe('formatDayLabel', () => {
  it('includes the day of month', () => {
    expect(formatDayLabel(new Date(2026, 5, 15))).toContain('15');
  });
});

describe('formatPercent', () => {
  it.each([
    [0, '0%'],
    [0.5, '50%'],
    [1, '100%'],
    [0.234, '23%'],
  ])('formats %s as %s', (input, expected) => {
    expect(formatPercent(input)).toBe(expected);
  });

  it('clamps out-of-range values', () => {
    expect(formatPercent(-0.5)).toBe('0%');
    expect(formatPercent(1.5)).toBe('100%');
  });
});
