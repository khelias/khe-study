/// <reference lib="webworker" />
// Replaces the worker to withdraw the installed app (AGENTS.md "Installed app"). It does not claim
// pages, so a page that registers it again after the reload below is not reloaded a second time.
import { deleteShellCaches } from './names';

declare const self: ServiceWorkerGlobalScope;

async function withdraw(): Promise<void> {
  await deleteShellCaches();
  await self.registration.unregister();
  const windows = await self.clients.matchAll({ type: 'window' });
  await Promise.all(windows.map((client) => client.navigate(client.url)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(withdraw());
});
