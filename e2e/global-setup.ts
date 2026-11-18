import { cpSync, rmSync } from 'node:fs';
import { build, type Plugin } from 'vite';
import { writeKillSwitch } from '../src/offline/serviceWorkerPlugin';
import { BUILD_A, BUILD_B, BUILD_KILLED } from './offline-paths';

/** Tells two builds of the same source apart, and gives each a worker of its own. */
const marked = (name: string): Plugin => ({
  name: 'e2e-build-mark',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { name: 'e2e-build', content: name }, injectTo: 'head' },
  ],
});

const buildAs = (name: string, outDir: string) =>
  build({ logLevel: 'warn', plugins: [marked(name)], build: { outDir, emptyOutDir: true } });

export default async function globalSetup(): Promise<void> {
  await buildAs('a', BUILD_A);
  await buildAs('b', BUILD_B);
  rmSync(BUILD_KILLED, { recursive: true, force: true });
  cpSync(BUILD_A, BUILD_KILLED, { recursive: true });
  await writeKillSwitch(BUILD_KILLED);
}
