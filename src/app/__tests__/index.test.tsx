import { fireEvent, render } from '@testing-library/react-native';

import MemoriesScreen from '@/app/index';
import { useMemories, type MemoriesState } from '@/hooks/use-memories';

// Manual factory so jest does not try to auto-mock the real hook, which would
// load expo-media-library's native module (unavailable under jest).
jest.mock('@/hooks/use-memories', () => ({ useMemories: jest.fn() }));

const mockedUseMemories = useMemories as jest.MockedFunction<typeof useMemories>;

function renderWith(state: MemoriesState) {
  mockedUseMemories.mockReturnValue(state);
  return render(<MemoriesScreen />);
}

describe('MemoriesScreen', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows progress while loading', async () => {
    const { getByText, getByRole } = await renderWith({ status: 'loading', progress: 0.5 });
    expect(getByText('Looking back…')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
    expect(getByRole('progressbar')).toBeTruthy();
  });

  it('renders the unsupported message on web', async () => {
    const { getByText } = await renderWith({ status: 'unsupported' });
    expect(getByText('Open on your phone')).toBeTruthy();
  });

  it('renders the empty state when there are no memories', async () => {
    const { getByText } = await renderWith({ status: 'ready', groups: [], refresh: jest.fn() });
    expect(getByText('No memories yet')).toBeTruthy();
  });

  it('renders memory rows when groups exist', async () => {
    const { getByText } = await renderWith({
      status: 'ready',
      refresh: jest.fn(),
      groups: [{ year: 2024, yearsAgo: 2, photos: [{ id: '1', uri: 'file://1.jpg' }] }],
    });
    expect(getByText('On This Day')).toBeTruthy();
    expect(getByText('2024')).toBeTruthy();
  });

  it('shows the error message and retries on press', async () => {
    const retry = jest.fn();
    const { getByText } = await renderWith({ status: 'error', message: 'Disk on fire', retry });
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Disk on fire')).toBeTruthy();
    fireEvent.press(getByText('Try again'));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('lets the user request access when permission can be asked again', async () => {
    const requestPermission = jest.fn();
    const { getByText } = await renderWith({
      status: 'denied',
      canAskAgain: true,
      requestPermission,
    });
    fireEvent.press(getByText('Try again'));
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });
});
