import { describe, expect, it } from 'vitest';
import { daysBetween, formatDateBr, isIsoDate, todayInBrazil } from './dates';

describe('dates', () => {
  it('uses Brasília time for "today"', () => {
    // 02:00 UTC on 16/12 is still 15/12 in Brasília (UTC-3).
    expect(todayInBrazil(new Date('2026-12-16T02:00:00Z'))).toBe('2026-12-15');
    expect(todayInBrazil(new Date('2026-12-16T03:00:00Z'))).toBe('2026-12-16');
  });

  it('validates real calendar dates only', () => {
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('16/12/2026')).toBe(false);
  });

  it('counts days and formats Brazilian dates', () => {
    expect(daysBetween('2026-10-28', '2026-12-12')).toBe(45);
    expect(formatDateBr('2026-12-16')).toBe('16/12/2026');
  });
});
