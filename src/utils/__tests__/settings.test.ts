import {
  clampHour,
  DEFAULT_SETTINGS,
  formatHour,
  sanitizeSettings,
} from '@/utils/settings';

describe('clampHour', () => {
  it('keeps whole hours in range', () => {
    expect(clampHour(0, 9)).toBe(0);
    expect(clampHour(23, 9)).toBe(23);
  });

  it('clamps out-of-range and floors fractional hours', () => {
    expect(clampHour(-3, 9)).toBe(0);
    expect(clampHour(99, 9)).toBe(23);
    expect(clampHour(4.9, 9)).toBe(4);
  });

  it('falls back for non-numeric values', () => {
    expect(clampHour('nope', 9)).toBe(9);
    expect(clampHour(undefined, 4)).toBe(4);
    expect(clampHour(NaN, 7)).toBe(7);
  });
});

describe('sanitizeSettings', () => {
  it('returns the defaults for missing input', () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it('defaults the day window to 4am → 4am, the reminder to 9am, and the language to system', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      dayStartHour: 4,
      dayEndHour: 4,
      notificationHour: 9,
      language: 'system',
    });
  });

  it('merges and clamps partial input', () => {
    expect(sanitizeSettings({ dayStartHour: 0, notificationHour: 30 })).toEqual({
      dayStartHour: 0,
      dayEndHour: 4,
      notificationHour: 23,
      language: 'system',
    });
  });

  it('keeps a supported language and rejects unknown ones', () => {
    expect(sanitizeSettings({ language: 'de' }).language).toBe('de');
    expect(sanitizeSettings({ language: 'system' }).language).toBe('system');
    expect(sanitizeSettings({ language: 'xx' }).language).toBe('system');
    expect(sanitizeSettings({ language: 42 as unknown as string }).language).toBe('system');
  });
});

describe('formatHour', () => {
  it.each([
    [0, '12:00 AM'],
    [4, '4:00 AM'],
    [9, '9:00 AM'],
    [12, '12:00 PM'],
    [13, '1:00 PM'],
    [23, '11:00 PM'],
  ])('formats %s as %s', (hour, label) => {
    expect(formatHour(hour)).toBe(label);
  });
});
