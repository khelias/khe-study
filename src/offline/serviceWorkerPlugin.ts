import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { build, type InlineConfig, type Plugin } from 'vite';

const SOURCE_DIR = import.meta.dirname;
// Licence texts are for reading online.
const NOT_PRECACHED = /\.(md|txt)$/;

/** Every file under `dir`, relative to it. Dotfiles are left out: the deploy's `cp` skips them. */
function filesUnder(dir: string, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.'))
    .flatMap((entry) =>
      entry.isDirectory()
        ? filesUnder(join(dir, entry.name), `${prefix}${entry.name}/`)
        : [`${prefix}${entry.name}`],
    )
    .sort();
}

function workerBuild(entry: string, outDir: string, define: InlineConfig['define']): InlineConfig {
  return {
    configFile: false,
    logLevel: 'warn',
    define,
    build: {
      outDir,
      emptyOutDir: false,
      copyPublicDir: false,
      sourcemap: false,
      minify: true,
      lib: { entry, formats: ['iife'], name: 'studyWorker', fileName: () => 'sw.js' },
    },
  };
}

/** Writes the kill-switch as `sw.js` into a finished build. */
export async function writeKillSwitch(outDir: string): Promise<void> {
  await build(workerBuild(join(SOURCE_DIR, 'killSwitch.ts'), outDir, {}));
}

async function writeWorker(outDir: string, base: string): Promise<void> {
  const files = filesUnder(outDir);
  const hash = createHash('sha256');
  for (const file of files) hash.update(file).update(readFileSync(join(outDir, file)));
  for (const file of filesUnder(SOURCE_DIR)) hash.update(readFileSync(join(SOURCE_DIR, file)));
  const shell = files.filter((file) => !NOT_PRECACHED.test(file) && file !== 'index.html');
  await build(
    workerBuild(join(SOURCE_DIR, 'sw.ts'), outDir, {
      __SW_VERSION__: JSON.stringify(hash.digest('hex').slice(0, 12)),
      __SW_BASE__: JSON.stringify(base),
      __SW_PRECACHE__: JSON.stringify(['', ...shell]),
    }),
  );
}

/**
 * Writes `sw.js` beside the build, from the files the build really holds, with a version made from
 * their content, so any change to the app is a new worker with a new cache.
 */
export function serviceWorkerPlugin({ killSwitch = false } = {}): Plugin {
  let outDir = '';
  let base = '';
  return {
    name: 'study-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      base = config.base;
    },
    async closeBundle(error) {
      if (error) return;
      await (killSwitch ? writeKillSwitch(outDir) : writeWorker(outDir, base));
    },
  };
}
