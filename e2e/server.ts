// Serves a production build as the homelab's nginx does: the SPA fallback under /study/, a 404 for
// a missing hashed file or worker, `no-cache` on everything but the hashed files.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { PRODUCT_ROOT as BASE } from '../src/theme/productRoot.ts';
import { LIVE, OFFLINE_PORT } from './offline-paths.ts';

const root = resolve(LIVE);
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

createServer((request, response) => {
  const path = new URL(request.url ?? '/', 'http://localhost').pathname;
  const relative = path.slice(BASE.length);
  let file = join(root, relative);
  const inside = path.startsWith(BASE);
  const found = inside && existsSync(file) && statSync(file).isFile();
  const noFallback = relative.startsWith('assets/') || relative === 'sw.js';
  if (!inside || (!found && noFallback)) {
    response.statusCode = 404;
    response.end();
    return;
  }
  if (!found) file = join(root, 'index.html');
  response.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
  response.setHeader(
    'Cache-Control',
    relative.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
  );
  createReadStream(file).pipe(response);
}).listen(OFFLINE_PORT, '127.0.0.1');
