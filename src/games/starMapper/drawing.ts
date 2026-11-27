import type { Constellation, FigureLine } from '../../types/game';
import { BRIGHT_STARS } from './sky/brightStars';
import { angleBetween, equatorialVector } from './sky/astro';

/** The lines a learner has drawn, in order, each marked right or wrong. */
export interface Drawing {
  lines: readonly { line: FigureLine; right: boolean }[];
}

export const EMPTY_DRAWING: Drawing = { lines: [] };

const same = (a: FigureLine, b: FigureLine) =>
  (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);

export const inFigure = (figure: readonly FigureLine[], line: FigureLine) =>
  figure.some((f) => same(f, line));

export type AddResult = 'same-star' | 'repeat' | 'right' | 'wrong';

/** Adds a line between two stars; a line drawn before or a star to itself adds nothing. */
export function addLine(
  drawing: Drawing,
  figure: readonly FigureLine[],
  line: FigureLine,
): { drawing: Drawing; result: AddResult } {
  if (line[0] === line[1]) return { drawing, result: 'same-star' };
  if (drawing.lines.some((d) => same(d.line, line))) return { drawing, result: 'repeat' };
  const right = inFigure(figure, line);
  return {
    drawing: { lines: [...drawing.lines, { line, right }] },
    result: right ? 'right' : 'wrong',
  };
}

export const undoLine = (drawing: Drawing): Drawing => ({ lines: drawing.lines.slice(0, -1) });

/** A wrong line counts against the lines left, as a right one does. */
export const linesLeft = (drawing: Drawing, figure: readonly FigureLine[]) =>
  figure.length - drawing.lines.length;

export const isComplete = (drawing: Drawing, figure: readonly FigureLine[]) =>
  figure.every((f) => drawing.lines.some((d) => d.right && same(d.line, f)));

/** The first figure line not yet drawn, for the "next line" hint. */
export const nextMissingLine = (drawing: Drawing, figure: readonly FigureLine[]) =>
  figure.find((f) => !drawing.lines.some((d) => d.right && same(d.line, f))) ?? null;

/** The order the figure's stars light up in when it is found. */
export const starOrder = (figure: readonly FigureLine[]): number[] => [...new Set(figure.flat())];

const brightestOf = (c: Constellation): number => {
  const hips = starOrder(c.lines);
  return hips.reduce((best, hip) =>
    (BRIGHT_STARS.get(hip)?.mag ?? 9) < (BRIGHT_STARS.get(best)?.mag ?? 9) ? hip : best,
  );
};

/** Suur Vanker's front two stars, Merak and Dubhe, point to Põhjanael. */
const DUBHE = 54061;
const POLARIS = 11767;

/**
 * A star hop to the target: from Dubhe to Põhjanael for Väike Vanker, else
 * from the brightest star of the nearest easy constellation to the target's
 * brightest star.
 */
export function starHop(
  target: Constellation,
  all: readonly Constellation[],
): { from: number; to: number } {
  if (target.id === 'ursa_minor') return { from: DUBHE, to: POLARIS };
  const t = equatorialVector(target.centre.ra, target.centre.dec);
  const nearest = all
    .filter((c) => c.difficulty === 'easy' && c.id !== target.id)
    .map((c) => ({ c, d: angleBetween(t, equatorialVector(c.centre.ra, c.centre.dec)) }))
    .sort((a, b) => a.d - b.d)[0]?.c;
  return { from: nearest ? brightestOf(nearest) : POLARIS, to: brightestOf(target) };
}
