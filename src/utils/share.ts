import { getAssetInfoAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';

/**
 * Resolves an asset to a shareable local file URI. Photos that live only in
 * iCloud are downloaded on demand so the share sheet has a real file to hand to
 * other apps.
 */
export async function resolveShareUri(id: string): Promise<string | null> {
  const info = await getAssetInfoAsync(id, { shouldDownloadFromNetwork: true });
  return info.localUri ?? info.uri ?? null;
}

/**
 * Opens the system share sheet for one or more library assets. Returns `false`
 * when sharing is unavailable or nothing could be resolved.
 */
export async function shareAssets(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return false;
  if (!(await Sharing.isAvailableAsync())) return false;

  // expo-sharing shares a single file at a time; share the first selected
  // asset. (A future enhancement could zip multiple files.)
  const uri = await resolveShareUri(ids[0]);
  if (!uri) return false;

  await Sharing.shareAsync(uri);
  return true;
}
