import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

describe('ThemedView', () => {
  it('renders children', async () => {
    const { getByText } = await render(
      <ThemedView>
        <Text>Inside</Text>
      </ThemedView>,
    );
    expect(getByText('Inside')).toBeTruthy();
  });

  it('applies the background color by default', async () => {
    const { getByTestId } = await render(<ThemedView testID="view" />);
    expect(getByTestId('view')).toHaveStyle({ backgroundColor: Colors.light.background });
  });

  it('applies a themed background variant', async () => {
    const { getByTestId } = await render(<ThemedView testID="view" type="backgroundElement" />);
    expect(getByTestId('view')).toHaveStyle({ backgroundColor: Colors.light.backgroundElement });
  });
});
