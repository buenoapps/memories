import { Asset } from 'expo-media-library';
import * as Sharing from 'expo-sharing';

import { resolveShareUri, shareAssets } from '@/utils/share';

const mockShareAsync = Sharing.shareAsync as jest.Mock;
const mockIsAvailable = Sharing.isAvailableAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAvailable.mockResolvedValue(true);
});

describe('resolveShareUri', () => {
  it('resolves the asset id to a file uri via the new Asset API', async () => {
    const uri = await resolveShareUri('ph://abc');
    expect(uri).toBe('file://x.jpg');
  });

  it('returns null instead of throwing when the asset cannot be resolved', async () => {
    jest
      .spyOn(Asset.prototype, 'getUri')
      .mockRejectedValueOnce(new Error('Asset is only in iCloud'));

    await expect(resolveShareUri('ph://missing')).resolves.toBeNull();
  });
});

describe('shareAssets', () => {
  it('opens the share sheet with the resolved file uri', async () => {
    const ok = await shareAssets(['ph://abc']);

    expect(ok).toBe(true);
    expect(mockShareAsync).toHaveBeenCalledWith('file://x.jpg');
  });

  it('does nothing when there are no ids', async () => {
    const ok = await shareAssets([]);

    expect(ok).toBe(false);
    expect(mockShareAsync).not.toHaveBeenCalled();
  });

  it('does nothing when sharing is unavailable', async () => {
    mockIsAvailable.mockResolvedValue(false);

    const ok = await shareAssets(['ph://abc']);

    expect(ok).toBe(false);
    expect(mockShareAsync).not.toHaveBeenCalled();
  });

  it('returns false when the asset uri cannot be resolved', async () => {
    jest
      .spyOn(Asset.prototype, 'getUri')
      .mockRejectedValueOnce(new Error('Asset is only in iCloud'));

    const ok = await shareAssets(['ph://missing']);

    expect(ok).toBe(false);
    expect(mockShareAsync).not.toHaveBeenCalled();
  });
});
