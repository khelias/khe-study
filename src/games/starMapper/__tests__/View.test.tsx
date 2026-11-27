import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { StarMapperView } from '../View';
import { setLocale } from '../../../i18n';
import {
  ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK,
  getConstellationById,
} from '../../../curriculum/packs/astronomy/visibleFromEstonia';
import { generateStarMapper } from '../generator';
import { createRng } from '../../../engine/rng';
import type { StarMapperProblem } from '../../../types/game';

vi.mock('../../../engine/audio', () => ({
  playSound: vi.fn(),
  playScaleNote: vi.fn(),
  playChord: vi.fn(),
}));

// The WebGL sky is mocked: one frame positions the overlay on a 400×800 sky.
vi.mock('../sky/SkyCanvas', () => ({
  SkyCanvas: ({
    onFrame,
  }: {
    onFrame: (t: number, s: { width: number; height: number }) => void;
  }) => {
    useEffect(() => {
      // Like requestAnimationFrame: after every component's effects have run.
      const id = setTimeout(() => onFrame(16, { width: 400, height: 800 }), 0);
      return () => clearTimeout(id);
    });
    return <div data-testid="sky" />;
  },
}));

const problemFor = (id: string, mode: StarMapperProblem['mode'] = 'draw'): StarMapperProblem => {
  const base = generateStarMapper(1, createRng(1));
  const constellation = getConstellationById(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items, id);
  if (!constellation) throw new Error(`No constellation ${id}`);
  const generated = generateStarMapper(1, createRng(1), {
    avoidContentIds: ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items
      .map((c) => c.id)
      .filter((c) => c !== id),
  });
  return {
    ...base,
    ...generated,
    uid: `${id}-${mode}`,
    mode,
    showGuide: mode === 'draw' || mode === 'draw_name',
    options:
      mode === 'draw_name'
        ? [id, 'orion', 'leo', 'lyra'].filter((x, i, a) => a.indexOf(x) === i)
        : undefined,
    tracedIds: ['orion'],
  };
};

const star = (hip: number) =>
  document.querySelector<SVGGElement>(`[data-hip="${hip}"]`) ??
  (() => {
    throw new Error(`star ${hip}`);
  })();

const activate = (hip: number) => fireEvent.keyDown(star(hip), { key: 'Enter' });

function drawAll(problem: StarMapperProblem) {
  for (const [a, b] of problem.constellation.lines) {
    activate(a);
    activate(b);
    // A line selects its end star; clear it so the next pair starts fresh.
    if (document.querySelector(`[data-hip="${b}"][aria-pressed="true"]`)) activate(b);
  }
}

describe('StarMapperView', () => {
  beforeEach(() => {
    setLocale('et');
    vi.useRealTimers();
  });

  it('labels the stars in Estonian, by name where it has one', () => {
    render(<StarMapperView problem={problemFor('lyra')} onAnswer={vi.fn()} soundEnabled={false} />);
    expect(screen.getByRole('button', { name: 'Täht Vega', hidden: true })).toBeTruthy();
    expect(
      screen.getAllByRole('button', { name: /^Täht \d+$/, hidden: true }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Joonista Lüüra')).toBeTruthy();
  });

  it('draws a line star to star with two taps and marks the selected star', () => {
    const p = problemFor('cassiopeia');
    render(<StarMapperView problem={p} onAnswer={vi.fn()} soundEnabled={false} />);
    const [a, b] = p.constellation.lines[0]!;
    activate(a);
    expect(star(a).getAttribute('aria-label')).toMatch(/valitud$/);
    activate(b);
    expect(document.querySelectorAll('line.sky-line').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(`Veel ${p.constellation.lines.length - 1} joont`)).toBeTruthy();
  });

  it('draws a line by dragging from star to star', async () => {
    const p = problemFor('cassiopeia');
    render(<StarMapperView problem={p} onAnswer={vi.fn()} soundEnabled={false} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    const [a, b] = p.constellation.lines[0]!;
    const [, x, y] =
      /translate\(([-\d.]+) ([-\d.]+)\)/.exec(star(b).getAttribute('transform') ?? '') ?? [];
    fireEvent.pointerDown(star(a), { pointerId: 1, clientX: 0, clientY: 0 });
    const svg = star(a).ownerSVGElement!;
    fireEvent.pointerMove(svg, { pointerId: 1, clientX: Number(x), clientY: Number(y) });
    fireEvent.pointerUp(svg, { pointerId: 1, clientX: Number(x), clientY: Number(y) });
    expect(screen.getByLabelText(`Veel ${p.constellation.lines.length - 1} joont`)).toBeTruthy();
  });

  it('counts a wrong line against the lines left and undoes it', () => {
    const p = problemFor('cassiopeia');
    render(<StarMapperView problem={p} onAnswer={vi.fn()} soundEnabled={false} />);
    const figure = new Set(p.constellation.lines.flat());
    const decoy = p.stars.find((s) => !figure.has(s.hip))!.hip;
    activate(p.constellation.lines[0]![0]);
    activate(decoy);
    expect(document.querySelectorAll('line.sky-wrong')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
    expect(document.querySelectorAll('line.sky-wrong')).toHaveLength(0);
  });

  it('resets and answers wrong when the lines run out', () => {
    const p = problemFor('cassiopeia');
    const onAnswer = vi.fn();
    render(<StarMapperView problem={p} onAnswer={onAnswer} soundEnabled={false} />);
    const figure = new Set(p.constellation.lines.flat());
    const decoys = p.stars.filter((s) => !figure.has(s.hip)).map((s) => s.hip);
    for (let i = 0; i < p.constellation.lines.length; i++) {
      activate(decoys[i]!);
      activate(decoys[i + 1]!);
      if (document.querySelector('[aria-pressed="true"]')) activate(decoys[i + 1]!);
    }
    expect(onAnswer).toHaveBeenCalledWith(false);
    expect(document.querySelectorAll('line.sky-wrong')).toHaveLength(0);
  });

  it('shows the found card when the figure is done, and Edasi answers once', () => {
    vi.useFakeTimers();
    const p = problemFor('cassiopeia');
    const onAnswer = vi.fn();
    render(<StarMapperView problem={p} onAnswer={onAnswer} soundEnabled={false} />);
    drawAll(p);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Leitud')).toBeTruthy();
    const edasi = screen.getByRole('button', { name: 'Edasi' });
    fireEvent.click(edasi);
    fireEvent.click(edasi);
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('asks for the name after drawing in Joonista ja nimeta', () => {
    vi.useFakeTimers();
    const p = problemFor('cassiopeia', 'draw_name');
    const onAnswer = vi.fn();
    render(<StarMapperView problem={p} onAnswer={onAnswer} soundEnabled={false} />);
    expect(screen.queryByText(/Kassiopeia/)).toBeNull();
    drawAll(p);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Mis tähtkuju see on?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Orion' }));
    expect(onAnswer).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByRole('button', { name: 'Kassiopeia' }));
    expect(screen.getByText('Leitud')).toBeTruthy();
  });

  it('the next-line hint clears wrong lines, so it never uses up the last line', () => {
    const p = problemFor('cassiopeia');
    const onAnswer = vi.fn();
    const spendStars = vi.fn(() => true);
    render(
      <StarMapperView
        problem={p}
        onAnswer={onAnswer}
        soundEnabled={false}
        stars={9}
        spendStars={spendStars}
      />,
    );
    const figure = new Set(p.constellation.lines.flat());
    const decoys = p.stars.filter((s) => !figure.has(s.hip)).map((s) => s.hip);
    // Every line but one used up by wrong lines.
    for (let i = 0; i < p.constellation.lines.length - 1; i++) {
      activate(decoys[i]!);
      activate(decoys[i + 1]!);
      if (document.querySelector('[aria-pressed="true"]')) activate(decoys[i + 1]!);
    }
    fireEvent.click(screen.getByRole('button', { name: 'Vihje' }));
    fireEvent.click(screen.getByRole('button', { name: /Järgmine joon/ }));
    expect(onAnswer).not.toHaveBeenCalled();
    expect(document.querySelectorAll('line.sky-wrong')).toHaveLength(0);
  });

  it('opens Minu taevas with the traced constellations only', () => {
    render(
      <StarMapperView problem={problemFor('cassiopeia')} onAnswer={vi.fn()} soundEnabled={false} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Minu taevas' }));
    expect(screen.getByRole('heading', { name: 'Minu taevas' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Orion', hidden: true })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Kassiopeia', hidden: true })).toBeNull();
    expect(screen.getByRole('img', { name: 'Talvetaevas: 1/8' })).toBeTruthy();
  });
});
