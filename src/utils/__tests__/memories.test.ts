import {
  buildSingleYear,
  buildYears,
  dayRange,
  formatDayLabel,
  formatPercent,
  formatRelativeDayLabel,
  isSameMonthDay,
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

describe('buildSingleYear', () => {
  it('returns one entry with yearsAgo relative to the anchor', () => {
    expect(buildSingleYear(new Date(2026, 5, 15), 2020)).toEqual([{ year: 2020, yearsAgo: 6 }]);
  });
});

describe('isSameMonthDay', () => {
  it('ignores the year', () => {
    expect(isSameMonthDay(new Date(2026, 5, 15), new Date(2001, 5, 15))).toBe(true);
    expect(isSameMonthDay(new Date(2026, 5, 15), new Date(2026, 5, 16))).toBe(false);
  });
});

describe('formatRelativeDayLabel', () => {
  it('returns "Today" for the current month/day', () => {
    const now = new Date(2026, 5, 15);
    expect(formatRelativeDayLabel(new Date(2026, 5, 15), now)).toBe('Today');
  });

  it('returns the day label for other days', () => {
    const now = new Date(2026, 5, 15);
    expect(formatRelativeDayLabel(new Date(2026, 5, 16), now)).toContain('16');
  });
});

describe('dayRange', () => {
  it('spans a full calendar day in epoch milliseconds by default', () => {
    const { start, end } = dayRange(2024, 5, 15);
    expect(start).toBe(new Date(2024, 5, 15, 0, 0, 0, 0).getTime());
    expect(end - start).toBe(24 * 60 * 60 * 1000 - 1);
  });

  it('runs from the start hour until the end hour the next morning', () => {
    const { start, end } = dayRange(2024, 5, 15, 4, 4);
    expect(start).toBe(new Date(2024, 5, 15, 4, 0, 0, 0).getTime());
    // 4am to 4am the next day is a 24h window, exclusive of the final instant.
    expect(end).toBe(new Date(2024, 5, 16, 4, 0, 0, 0).getTime() - 1);
    expect(end - start).toBe(24 * 60 * 60 * 1000 - 1);
  });

  it('can stretch past midnight, e.g. midnight until 4am the next day', () => {
    const { start, end } = dayRange(2024, 5, 15, 0, 4);
    expect(start).toBe(new Date(2024, 5, 15, 0, 0, 0, 0).getTime());
    expect(end).toBe(new Date(2024, 5, 16, 4, 0, 0, 0).getTime() - 1);
    expect(end - start).toBe(28 * 60 * 60 * 1000 - 1);
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
