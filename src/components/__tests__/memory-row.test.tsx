import { render } from '@testing-library/react-native';

import { MemoryRow } from '@/components/memory-row';
import type { MemoryGroup } from '@/hooks/use-memories';

function makeGroup(overrides: Partial<MemoryGroup> = {}): MemoryGroup {
  return {
    year: 2021,
    yearsAgo: 5,
    photos: [
      { id: '1', uri: 'file://1.jpg', isVideo: false },
      { id: '2', uri: 'file://2.jpg', isVideo: false },
      { id: '3', uri: 'file://3.jpg', isVideo: false },
    ],
    ...overrides,
  };
}

describe('MemoryRow', () => {
  it('shows the year and a "years ago" / count summary', async () => {
    const { getByText } = await render(<MemoryRow group={makeGroup()} />);
    expect(getByText('2021')).toBeTruthy();
    expect(getByText('5 years ago · 3 photos')).toBeTruthy();
  });

  it('labels the current year as Today with singular photo count', async () => {
    const { getByText } = await render(
      <MemoryRow
        group={makeGroup({
          year: 2026,
          yearsAgo: 0,
          photos: [{ id: '1', uri: 'file://1.jpg', isVideo: false }],
        })}
      />,
    );
    expect(getByText('Today · 1 photo')).toBeTruthy();
  });
});
