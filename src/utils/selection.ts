/**
 * Pure helpers for the multi-select mode on the memory lists. Selection is
 * represented as an array of asset ids so it is trivial to test and to pass
 * through React state.
 */

/** Adds or removes an id from the selection, returning a new array. */
export function toggleId(selected: string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((entry) => entry !== id) : [...selected, id];
}

/** True when every id in `all` is currently selected (and there is at least one). */
export function isAllSelected(selected: string[], all: string[]): boolean {
  return all.length > 0 && all.every((id) => selected.includes(id));
}

/** Selects everything when not all selected, otherwise clears the selection. */
export function toggleSelectAll(selected: string[], all: string[]): string[] {
  return isAllSelected(selected, all) ? [] : [...all];
}

/** Human label for the selection toolbar, e.g. "3 Selected" or "Select Items". */
export function selectionTitle(count: number): string {
  if (count === 0) return 'Select Items';
  return `${count} Selected`;
}
