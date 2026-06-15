import { renderHook, waitFor } from '@testing-library/react-native';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-media-library';

import { useMemories } from '@/hooks/use-memories';

// Controllable query executor shared with the mocked module below.
const mockExe = jest.fn();

jest.mock('expo-media-library', () => ({
  AssetField: { MEDIA_TYPE: 'mediaType', CREATION_TIME: 'creationTime' },
  MediaType: { IMAGE: 'image' },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  Query: jest.fn().mockImplementation(() => ({
    eq() {
      return this;
    },
    gte() {
      return this;
    },
    lte() {
      return this;
    },
    orderBy() {
      return this;
    },
    exe: (...args: unknown[]) => mockExe(...args),
  })),
}));

const mockGetPermissions = getPermissionsAsync as jest.Mock;
const mockRequestPermissions = requestPermissionsAsync as jest.Mock;

function asset(id: string) {
  return { id, getUri: jest.fn().mockResolvedValue(`file://${id}.jpg`) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockExe.mockResolvedValue([]);
});

describe('useMemories', () => {
  it('loads grouped photos when permission is granted', async () => {
    mockGetPermissions.mockResolvedValue({ granted: true, canAskAgain: true });
    // First query (this year) returns two photos, the rest return none.
    mockExe.mockResolvedValueOnce([asset('a'), asset('b')]);

    const { result } = await renderHook(() => useMemories());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    if (result.current.status !== 'ready') throw new Error('expected ready');

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0]).toMatchObject({ yearsAgo: 0 });
    expect(result.current.groups[0].photos).toEqual([
      { id: 'a', uri: 'file://a.jpg' },
      { id: 'b', uri: 'file://b.jpg' },
    ]);
  });

  it('reports the denied state when permission cannot be requested', async () => {
    mockGetPermissions.mockResolvedValue({ granted: false, canAskAgain: false });

    const { result } = await renderHook(() => useMemories());

    await waitFor(() => expect(result.current.status).toBe('denied'));
    if (result.current.status !== 'denied') throw new Error('expected denied');
    expect(result.current.canAskAgain).toBe(false);
  });

  it('asks for permission and loads when the user grants access', async () => {
    mockGetPermissions.mockResolvedValue({ granted: false, canAskAgain: true });
    mockRequestPermissions.mockResolvedValue({ granted: true, canAskAgain: false });

    const { result } = await renderHook(() => useMemories());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(mockRequestPermissions).toHaveBeenCalled();
  });

  it('surfaces an error state when the library throws', async () => {
    mockGetPermissions.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => useMemories());

    await waitFor(() => expect(result.current.status).toBe('error'));
    if (result.current.status !== 'error') throw new Error('expected error');
    expect(result.current.message).toBe('boom');
    expect(typeof result.current.retry).toBe('function');
  });
});
