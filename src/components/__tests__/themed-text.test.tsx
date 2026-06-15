import { render } from '@testing-library/react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

describe('ThemedText', () => {
  it('renders its children', async () => {
    const { getByText } = await render(<ThemedText>Hello</ThemedText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('uses the themed text color by default', async () => {
    const { getByText } = await render(<ThemedText>Tinted</ThemedText>);
    expect(getByText('Tinted')).toHaveStyle({ color: Colors.light.text });
  });

  it('honours an explicit themeColor', async () => {
    const { getByText } = await render(<ThemedText themeColor="textSecondary">Muted</ThemedText>);
    expect(getByText('Muted')).toHaveStyle({ color: Colors.light.textSecondary });
  });
});
