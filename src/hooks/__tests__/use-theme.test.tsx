import { renderHook } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

describe('useTheme', () => {
  it('falls back to the light palette when no scheme is set', async () => {
    const { result } = await renderHook(() => useTheme());
    expect(result.current).toEqual(Colors.light);
  });
});
