#!/usr/bin/env node
// Cuts the sky data for Tähistaevas (star_mapper) out of d3-celestial at one
// pinned commit and writes it into src/games/starMapper/sky/data/ (ADR-0007).
// Run: node scripts/build-sky-data.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const COMMIT = '7e720a3de062059d4c5400a379146a601d9010e0';
const BASE = `https://raw.githubusercontent.com/ofrohn/d3-celestial/${COMMIT}`;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../src/games/starMapper/sky/data');

/**
 * Pack constellations: id, IAU code, tier. The easy tier draws its simple
 * asterism. Every constellation whose figure centre culminates at 20° or more
 * from 59° N is here, except Perseus, Hercules, Ophiuchus and Pisces, whose
 * IAU figures have more than MAX_LINES lines.
 */
const PACK = [
  ['ursa_major', 'UMa', 'easy'],
  ['ursa_minor', 'UMi', 'easy'],
  ['cassiopeia', 'Cas', 'easy'],
  ['orion', 'Ori', 'easy'],
  ['cygnus', 'Cyg', 'easy'],
  ['lyra', 'Lyr', 'easy'],
  ['pegasus', 'Peg', 'easy'],
  ['leo', 'Leo', 'easy'],
  ['corona_borealis', 'CrB', 'easy'],
  ['gemini', 'Gem', 'easy'],
  ['cepheus', 'Cep', 'medium'],
  ['aquila', 'Aql', 'medium'],
  ['taurus', 'Tau', 'medium'],
  ['auriga', 'Aur', 'medium'],
  ['andromeda', 'And', 'medium'],
  ['bootes', 'Boo', 'medium'],
  ['canis_minor', 'CMi', 'medium'],
  ['aries', 'Ari', 'medium'],
  ['delphinus', 'Del', 'medium'],
  ['triangulum', 'Tri', 'medium'],
  ['sagitta', 'Sge', 'medium'],
  ['cancer', 'Cnc', 'medium'],
  ['virgo', 'Vir', 'medium'],
  ['draco', 'Dra', 'hard'],
  ['camelopardalis', 'Cam', 'hard'],
  ['canes_venatici', 'CVn', 'hard'],
  ['coma_berenices', 'Com', 'hard'],
  ['equuleus', 'Equ', 'hard'],
  ['lacerta', 'Lac', 'hard'],
  ['leo_minor', 'LMi', 'hard'],
  ['lynx', 'Lyn', 'hard'],
  ['monoceros', 'Mon', 'hard'],
  ['serpens', 'Ser', 'hard'],
  ['sextans', 'Sex', 'hard'],
  ['vulpecula', 'Vul', 'hard'],
  ['cetus', 'Cet', 'hard'],
  ['scutum', 'Sct', 'hard'],
  ['aquarius', 'Aqr', 'hard'],
];

/** The easy tier's asterisms, as pairs of Bayer designations. */
const ASTERISMS = {
  UMa: [
    ['η', 'ζ'],
    ['ζ', 'ε'],
    ['ε', 'δ'],
    ['δ', 'γ'],
    ['γ', 'β'],
    ['β', 'α'],
    ['α', 'δ'],
  ],
  UMi: [
    ['α', 'δ'],
    ['δ', 'ε'],
    ['ε', 'ζ'],
    ['ζ', 'β'],
    ['β', 'γ'],
    ['γ', 'η'],
    ['η', 'ζ'],
  ],
  Cas: [
    ['ε', 'δ'],
    ['δ', 'γ'],
    ['γ', 'α'],
    ['α', 'β'],
  ],
  Ori: [
    ['α', 'γ'],
    ['α', 'ζ'],
    ['γ', 'δ'],
    ['δ', 'ε'],
    ['ε', 'ζ'],
    ['ζ', 'κ'],
    ['δ', 'β'],
    ['α', 'λ'],
    ['γ', 'λ'],
  ],
  Cyg: [
    ['α', 'γ'],
    ['γ', 'η'],
    ['η', 'β'],
    ['ε', 'γ'],
    ['γ', 'δ'],
  ],
  Lyr: [
    ['α', 'ε1'],
    ['α', 'ζ1'],
    ['ε1', 'ζ1'],
    ['ζ1', 'β'],
    ['β', 'γ'],
    ['γ', 'δ2'],
    ['δ2', 'ζ1'],
  ],
  Peg: [
    ['α', 'β'],
    ['β', 'α And'],
    ['α And', 'γ'],
    ['γ', 'α'],
  ],
  Leo: [
    ['α', 'η'],
    ['η', 'γ'],
    ['γ', 'ζ'],
    ['ζ', 'μ'],
    ['μ', 'ε'],
    ['γ', 'δ'],
    ['δ', 'β'],
    ['β', 'θ'],
    ['θ', 'α'],
  ],
  CrB: [
    ['θ', 'β'],
    ['β', 'α'],
    ['α', 'γ'],
    ['γ', 'δ'],
    ['δ', 'ε'],
    ['ε', 'ι'],
  ],
  Gem: [
    ['α', 'β'],
    ['α', 'τ'],
    ['τ', 'ε'],
    ['ε', 'μ'],
    ['β', 'δ'],
    ['δ', 'ζ'],
    ['ζ', 'γ'],
  ],
};

/**
 * IAU line endpoints with no catalogue star within the match radius, by hand,
 * as `IAU:lon,lat` to HIP. Mira in Cetus (34.8366,-2.9776) is a variable missing
 * from the magnitude-6 list; its two lines are left out.
 */
const ENDPOINT_OVERRIDES = {};
const KNOWN_UNMATCHED = new Set(['Cet:34.8366,-2.9776']);

const MAX_LINES = 16;
const MATCH_DEG = 0.05;

async function get(name) {
  const res = await fetch(`${BASE}/data/${name}`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return name.endsWith('.json') ? res.json() : res.text();
}

const r3 = (x) => Math.round(x * 1000) / 1000;
const ra360 = (lon) => (lon < 0 ? lon + 360 : lon);
const rad = Math.PI / 180;

function angDist(ra1, dec1, ra2, dec2) {
  const c =
    Math.sin(dec1 * rad) * Math.sin(dec2 * rad) +
    Math.cos(dec1 * rad) * Math.cos(dec2 * rad) * Math.cos((ra1 - ra2) * rad);
  return Math.acos(Math.min(1, Math.max(-1, c))) / rad;
}

const [stars, lines, names, mw, license] = await Promise.all([
  get('stars.6.json'),
  get('constellations.lines.json'),
  get('starnames.json'),
  get('mw.json'),
  fetch(`${BASE}/LICENSE`).then((r) => r.text()),
]);

const byHip = new Map();
for (const f of stars.features) {
  const [lon, dec] = f.geometry.coordinates;
  byHip.set(f.id, {
    hip: f.id,
    ra: ra360(lon),
    dec,
    mag: f.properties.mag,
    bv: Number.parseFloat(f.properties.bv) || 0.6,
  });
}

function nearestStar(ra, dec) {
  let best = null;
  let bestD = Infinity;
  for (const s of byHip.values()) {
    if (Math.abs(s.dec - dec) > MATCH_DEG) continue;
    const d = angDist(ra, dec, s.ra, s.dec);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return bestD <= MATCH_DEG ? best : null;
}

function byDesignation(desig, constellation) {
  const [bayer, c = constellation] = desig.split(' ');
  let best = null;
  for (const [hip, n] of Object.entries(names)) {
    if (n.c !== c || (n.bayer !== bayer && n.bayer !== `${bayer}1`)) continue;
    const s = byHip.get(Number(hip));
    if (s && (!best || s.mag < best.mag)) best = s;
  }
  if (!best) throw new Error(`no star ${bayer} ${c}`);
  return best.hip;
}

const iauLines = new Map(lines.features.map((f) => [f.id, f.geometry.coordinates]));
const figures = {};
const unmatched = [];
for (const [id, iau] of PACK) {
  const pairs = new Set();
  if (ASTERISMS[iau]) {
    for (const [a, b] of ASTERISMS[iau])
      pairs.add(`${byDesignation(a, iau)}-${byDesignation(b, iau)}`);
  } else {
    for (const path of iauLines.get(iau) ?? []) {
      const hips = path.map(([lon, dec]) => {
        const key = `${iau}:${lon},${dec}`;
        if (ENDPOINT_OVERRIDES[key]) return ENDPOINT_OVERRIDES[key];
        const s = nearestStar(ra360(lon), dec);
        if (!s && !KNOWN_UNMATCHED.has(key)) unmatched.push(key);
        return s?.hip;
      });
      for (let i = 1; i < hips.length; i++) {
        const a = hips[i - 1];
        const b = hips[i];
        if (a && b && a !== b && !pairs.has(`${b}-${a}`)) pairs.add(`${a}-${b}`);
      }
    }
  }
  const list = [...pairs].map((p) => p.split('-').map(Number));
  if (list.length > MAX_LINES) throw new Error(`${id}: ${list.length} lines`);
  figures[id] = list;
}
if (unmatched.length) throw new Error(`unmatched endpoints: ${unmatched.join(' ')}`);

const figureHips = new Set(Object.values(figures).flat(2));
const catalog = [...byHip.values()]
  .filter((s) => s.dec > -40 || figureHips.has(s.hip))
  .sort((a, b) => a.mag - b.mag)
  .map((s) => [
    s.hip,
    r3(s.ra),
    r3(s.dec),
    Math.round(s.mag * 100) / 100,
    Math.round(s.bv * 100) / 100,
  ]);
const bright = catalog
  .filter(([hip, , , mag]) => mag < 4.5 || figureHips.has(hip))
  .map((s) => s.slice(0, 4));

// The Milky Way: five nested opacity levels rasterised equirectangular,
// x from RA -180° (left) to +180°, y from Dec +90° (top) to -90°.
const W = 1024;
const H = 512;
const acc = new Float32Array(W * H);
for (const feature of mw.features) {
  const level = new Uint8Array(W * H);
  const edges = [];
  for (const polygon of feature.geometry.coordinates) {
    for (const ring of polygon) {
      for (let i = 0; i < ring.length; i++) {
        const [x1, y1] = ring[i];
        const [x2, y2] = ring[(i + 1) % ring.length];
        edges.push([
          ((x1 + 180) / 360) * W,
          ((90 - y1) / 180) * H,
          ((x2 + 180) / 360) * W,
          ((90 - y2) / 180) * H,
        ]);
      }
    }
  }
  for (let y = 0; y < H; y++) {
    const yc = y + 0.5;
    const xs = [];
    for (const [x1, y1, x2, y2] of edges) {
      if (y1 <= yc !== y2 <= yc) xs.push(x1 + ((yc - y1) / (y2 - y1)) * (x2 - x1));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let x = Math.max(0, Math.ceil(xs[i] - 0.5)); x < Math.min(W, xs[i + 1] - 0.5); x++)
        level[y * W + x] = 1;
    }
  }
  for (let i = 0; i < W * H; i++) acc[i] += level[i];
}
// Polygons around the south pole cross the RA seam and fill whole rows; that
// sky never rises at 59° N (the horizon reaches Dec -31°), so it is cut.
acc.fill(0, Math.ceil(((90 + 45) / 180) * H) * W);
function blur(src, radius) {
  const tmp = new Float32Array(W * H);
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let k = -radius; k <= radius; k++) s += src[y * W + ((x + k + W) % W)];
      tmp[y * W + x] = s / (2 * radius + 1);
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let k = -radius; k <= radius; k++) s += tmp[Math.min(H - 1, Math.max(0, y + k)) * W + x];
      out[y * W + x] = s / (2 * radius + 1);
    }
  }
  return out;
}
const soft = blur(blur(acc, 3), 3);
const max = soft.reduce((m, v) => Math.max(m, v), 0) || 1;

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
const raw = Buffer.alloc((W + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W + 1)] = 0;
  for (let x = 0; x < W; x++) raw[y * (W + 1) + 1 + x] = Math.round((soft[y * W + x] / max) * 255);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 0;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

mkdirSync(OUT, { recursive: true });
const json = (rows) => `[\n${rows.map((r) => JSON.stringify(r)).join(',\n')}\n]\n`;
writeFileSync(join(OUT, 'catalog.json'), json(catalog));
writeFileSync(join(OUT, 'bright.json'), json(bright));
writeFileSync(
  join(OUT, 'figures.json'),
  `{\n${Object.entries(figures)
    .map(([id, l]) => `  ${JSON.stringify(id)}: ${JSON.stringify(l)}`)
    .join(',\n')}\n}\n`,
);
writeFileSync(join(OUT, 'milkyway.png'), png);
writeFileSync(
  join(OUT, 'LICENSE'),
  `Star positions, magnitudes, colours, constellation lines and the Milky Way
outline in this folder are cut from d3-celestial by Olaf Frohn
(https://github.com/ofrohn/d3-celestial, commit ${COMMIT}) by
scripts/build-sky-data.mjs. d3-celestial's sources: stars from XHIP, an
extended Hipparcos compilation (Anderson & Francis 2012, VizieR V/137D);
constellation lines from the IAU constellation pages with Olaf Frohn's
modifications; the Milky Way from the Milky Way Outline Catalog by
Jose R. Vieira (skymap.com). The figures of the ten easy constellations are
this game's own simple asterisms over the same stars.

${license.trim()}
`,
);
console.log(
  `catalog ${catalog.length}, bright ${bright.length}, figures ${Object.keys(figures).length}, milkyway.png ${png.length} B`,
);
