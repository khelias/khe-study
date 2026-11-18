// games.khe.ee/adventure/ shares this origin's Cache Storage, so everything here stays under one
// prefix and nothing outside it is ever deleted (estate ADR-041 point 1).
const SHELL_PREFIX = 'study-shell-';

/** One cache per build, so an update replaces the shell whole. */
export const shellCacheName = (version: string) => `${SHELL_PREFIX}${version}`;
export const isShellCache = (name: string) => name.startsWith(SHELL_PREFIX);

/** Deletes this app's caches, all but `keep`. */
export async function deleteShellCaches(keep?: string): Promise<void> {
  const names = await caches.keys();
  await Promise.all(
    names.filter((name) => isShellCache(name) && name !== keep).map((name) => caches.delete(name)),
  );
}
