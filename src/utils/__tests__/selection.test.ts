import { isAllSelected, selectionTitle, toggleId, toggleSelectAll } from '@/utils/selection';

describe('toggleId', () => {
  it('adds an id that is not selected', () => {
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes an id that is already selected', () => {
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('isAllSelected', () => {
  it('is true only when every id is selected', () => {
    expect(isAllSelected(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(isAllSelected(['a'], ['a', 'b'])).toBe(false);
  });

  it('is false for an empty list', () => {
    expect(isAllSelected([], [])).toBe(false);
  });
});

describe('toggleSelectAll', () => {
  it('selects everything when not all selected', () => {
    expect(toggleSelectAll(['a'], ['a', 'b'])).toEqual(['a', 'b']);
  });

  it('clears the selection when everything is selected', () => {
    expect(toggleSelectAll(['a', 'b'], ['a', 'b'])).toEqual([]);
  });
});

describe('selectionTitle', () => {
  it.each([
    [0, 'Select Items'],
    [1, '1 Selected'],
    [3, '3 Selected'],
  ])('maps %s to "%s"', (count, expected) => {
    expect(selectionTitle(count)).toBe(expected);
  });
});
