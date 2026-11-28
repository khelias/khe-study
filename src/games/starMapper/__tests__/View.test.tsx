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
  playMoment: vi.fn(),
  playScaleNote: vi.fn(),
  playChord: vi.fn(),
}));

type FrameFn = (t: number, s: { width: number; height: number }) => void;
const sky = vi.hoisted(() => ({ onFrame: null as FrameFn | null }));

// The WebGL sky is mocked: one frame positions the overlay on a 400×800 sky;
// a test drives more frames through `sky.onFrame`.
vi.mock('../sky/SkyCanvas', () => ({
  SkyCanvas: ({ onFrame }: { onFrame: FrameFn }) => {
    sky.onFrame = onFrame;
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

  it('drops a drag let go over empty sky', async () => {
    const p = problemFor('cassiopeia');
    render(<StarMapperView problem={p} onAnswer={vi.fn()} soundEnabled={false} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    const [a, b] = p.constellation.lines[0]!;
    activate(a);
    activate(b);
    const left = `Veel ${p.constellation.lines.length - 1} joont`;
    const c = p.constellation.lines.flat().find((h) => h !== a && h !== b)!;
    const [, x, y] =
      /translate\(([-\d.]+) ([-\d.]+)\)/.exec(star(c).getAttribute('transform') ?? '') ?? [];
    fireEvent.pointerDown(star(c), { pointerId: 2, clientX: Number(x), clientY: Number(y) });
    const svg = star(c).ownerSVGElement!;
    fireEvent.pointerUp(svg, { pointerId: 2, clientX: -500, clientY: -500 });
    expect(screen.getByLabelText(left)).toBeTruthy();
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

  it('marks the stage while the found card is up, so the shell hides its tip', () => {
    vi.useFakeTimers();
    const p = problemFor('cassiopeia');
    const { container } = render(
      <StarMapperView problem={p} onAnswer={vi.fn()} soundEnabled={false} />,
    );
    const stage = container.querySelector('.sky-stage')!;
    expect(stage.hasAttribute('data-card-up')).toBe(false);
    drawAll(p);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(stage.hasAttribute('data-card-up')).toBe(true);
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
    // The guides already show the shape in Joonista.
    expect(screen.queryByRole('button', { name: /Näita kuju/ })).toBeNull();
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

  /** Frames every 100 ms from `from` for `ms`. */
  const runFrames = (from: number, ms: number) =>
    act(() => {
      for (let t = from; t <= from + ms; t += 100) sky.onFrame?.(t, { width: 400, height: 800 });
    });

  it('the owl reads the task, and a tap repeats its last line', () => {
    vi.useFakeTimers();
    render(<StarMapperView problem={problemFor('lyra')} onAnswer={vi.fn()} soundEnabled={false} />);
    expect(screen.getByRole('status').textContent).toBe('Ühenda rõngaga tähed.');
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Huu, ütle uuesti' }));
    expect(screen.getByRole('status').textContent).toBe('Ühenda rõngaga tähed.');
  });

  it('the owl speaks per event: memory, a hint, the name step', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <StarMapperView
        problem={problemFor('cassiopeia', 'memory')}
        onAnswer={vi.fn()}
        soundEnabled={false}
        stars={9}
        spendStars={() => true}
      />,
    );
    expect(screen.getByRole('status').textContent).toBe('Nüüd ilma rõngasteta!');
    fireEvent.click(screen.getByRole('button', { name: 'Vihje' }));
    fireEvent.click(screen.getByRole('button', { name: /Näita kuju/ }));
    expect(screen.getByRole('status').textContent).toBe('Vaata kuju hästi.');
    expect(document.querySelector('[data-pose]')!.getAttribute('data-pose')).toBe('point');

    const named = problemFor('cassiopeia', 'draw_name');
    rerender(<StarMapperView problem={named} onAnswer={vi.fn()} soundEnabled={false} />);
    expect(screen.getByText('Joonista tähtkuju')).toBeTruthy();
    drawAll(named);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('status').textContent).toBe('Kas tead, kes see on?');
  });

  it('the dawn fails a level 5 task once, the owl sleeps, then the same night starts again', () => {
    vi.useFakeTimers();
    const p = { ...problemFor('cassiopeia'), level: 5 };
    const onAnswer = vi.fn();
    render(<StarMapperView problem={p} onAnswer={onAnswer} soundEnabled={false} />);
    expect(screen.getByRole('progressbar', { name: 'Aeg koiduni' })).toBeTruthy();
    activate(p.constellation.lines[0]![0]);
    activate(p.constellation.lines[0]![1]);
    runFrames(0, 70_000);
    expect(screen.getByRole('status').textContent).toBe('Kiirusta, koit tuleb!');
    runFrames(70_100, 25_000);
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(false);
    expect(document.querySelector('[data-pose]')!.getAttribute('data-pose')).toBe('sleep');
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(document.querySelectorAll('[data-k^="line-"]')).toHaveLength(0);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
    runFrames(95_200, 500);
    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeLessThan(5);
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });

  it('no dawn failure after the last line until a new problem', () => {
    vi.useFakeTimers();
    const p = { ...problemFor('cassiopeia'), level: 9 };
    const onAnswer = vi.fn();
    render(<StarMapperView problem={p} onAnswer={onAnswer} soundEnabled={false} />);
    // The last line lands one frame before the budget runs out.
    runFrames(0, 59_800);
    drawAll(p);
    runFrames(59_900, 30_000);
    expect(onAnswer).not.toHaveBeenCalledWith(false);
  });

  it('never fails at level 3', () => {
    const onAnswer = vi.fn();
    render(
      <StarMapperView
        problem={{ ...problemFor('cassiopeia'), level: 3 }}
        onAnswer={onAnswer}
        soundEnabled={false}
      />,
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
    runFrames(0, 200_000);
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('a treasure opens only when zoomed in, and a second tap opens no second card', async () => {
    const p = { ...problemFor('orion'), treasureId: 'orion_nebula' };
    render(<StarMapperView problem={p} onAnswer={vi.fn()} soundEnabled={false} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    const button = () => screen.getByRole('button', { name: 'Peidetud aare', hidden: true });
    act(() => {
      fireEvent.wheel(screen.getByTestId('sky'), { deltaY: 1000 });
    });
    fireEvent.click(button());
    expect(screen.queryByText('Orioni udukogu')).toBeNull();

    act(() => {
      fireEvent.wheel(screen.getByTestId('sky'), { deltaY: -3000 });
    });
    runFrames(100, 100);
    expect(button().closest('[data-k="treasure-zoom"]')!.getAttribute('display')).toBe('inline');
    const target = button();
    fireEvent.click(target);
    // Found: the treasure leaves the sky, so a second tap has nothing to open.
    fireEvent.click(target);
    expect(screen.getAllByText('Orioni udukogu')).toHaveLength(1);
    expect(document.querySelector('.sky-stage')!.hasAttribute('data-card-up')).toBe(true);
    expect(screen.queryByRole('button', { name: 'Peidetud aare', hidden: true })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sulge' }));
    expect(screen.queryByText('Orioni udukogu')).toBeNull();
  });

  it('shows the creature of a found easy constellation', () => {
    vi.useFakeTimers();
    const p = problemFor('cassiopeia');
    render(<StarMapperView problem={p} onAnswer={vi.fn()} soundEnabled={false} />);
    expect(document.querySelector('[data-creature]')).toBeNull();
    drawAll(p);
    expect(document.querySelector('[data-creature="cassiopeia"]')).toBeTruthy();
  });

  it('plays the season moment on the find that completes a season', () => {
    vi.useFakeTimers();
    const items = ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items;
    const target = items.find((c) => c.id === 'cassiopeia')!;
    const rest = items.filter((c) => c.season === target.season && c.id !== target.id);
    const p = { ...problemFor('cassiopeia'), tracedIds: rest.map((c) => c.id) };
    render(<StarMapperView problem={p} onAnswer={vi.fn()} soundEnabled={false} />);
    drawAll(p);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText(/tähtkujud leitud!$/)).toBeTruthy();
    expect(document.querySelectorAll('.sky-season-moment').length).toBe(rest.length + 1);
  });

  it('a meteor opens its card while drawing, not during the found card', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const p = problemFor('cassiopeia');
    render(<StarMapperView problem={p} onAnswer={vi.fn()} soundEnabled={false} />);
    const meteor = () => document.querySelector('[data-k="meteor-btn"] circle')!;
    // The first meteor is due 9 s into the task and crosses for 1.6 s.
    runFrames(0, 9_200);
    fireEvent.pointerDown(meteor());
    expect(screen.getByText('Meteoor')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sulge' }));

    runFrames(9_300, 10_000);
    drawAll(p);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Leitud')).toBeTruthy();
    fireEvent.pointerDown(meteor());
    expect(screen.queryByText('Meteoor')).toBeNull();
    vi.restoreAllMocks();
  });
});
