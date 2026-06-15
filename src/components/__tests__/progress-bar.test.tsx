import { render } from '@testing-library/react-native';

import { ProgressBar } from '@/components/progress-bar';

describe('ProgressBar', () => {
  it('sets the fill width to the given percentage', async () => {
    const { getByTestId } = await render(<ProgressBar progress={0.5} />);
    expect(getByTestId('progress-bar-fill')).toHaveStyle({ width: '50%' });
  });

  it('exposes an accessible progress value', async () => {
    const { getByRole } = await render(<ProgressBar progress={0.42} />);
    expect(getByRole('progressbar').props.accessibilityValue).toEqual({
      now: 42,
      min: 0,
      max: 100,
    });
  });

  it('clamps progress above 1', async () => {
    const { getByTestId } = await render(<ProgressBar progress={2} />);
    expect(getByTestId('progress-bar-fill')).toHaveStyle({ width: '100%' });
  });
});
