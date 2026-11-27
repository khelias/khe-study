import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { playChord, playSound, playScaleNote } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useAnswerLock } from '../../hooks/useAnswerLock';
import { getPackItems } from '../../curriculum';
import { ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK } from '../../curriculum/packs/astronomy/visibleFromEstonia';
import { STAR_MAPPER_CONFIG } from './config';
import type { Constellation, SkyStar, StarMapperProblem } from '../../types/game';
import {
  angleBetween,
  applyMat3,
  equatorialVector,
  estonianLocal,
  cameraFacing,
  fovToFit,
  skyMatrix,
  unproject,
  type Camera,
  type ScreenPoint,
} from './sky/astro';
import { SkyCanvas } from './sky/SkyCanvas';
import { SkyOverlay, type AtlasFigure, type DragLine, type OverlayFrame } from './sky/SkyOverlay';
import { capturePointer, useSkyCamera } from './sky/useSkyCamera';
import {
  addLine,
  EMPTY_DRAWING,
  isComplete,
  linesLeft as countLinesLeft,
  nextMissingLine,
  starHop,
  starOrder,
  undoLine,
  type Drawing,
} from './drawing';
import {
  AtlasPanel,
  BottomBar,
  FoundCard,
  HintRow,
  NameSheet,
  TopPanel,
  type ConstellationText,
} from './Panels';

interface StarMapperViewProps {
  problem: StarMapperProblem;
  onAnswer: (answer: boolean) => void;
  soundEnabled: boolean;
  stars?: number;
  spendStars?: (count: number) => boolean;
  paused?: boolean;
}

type Phase = 'find' | 'draw' | 'complete' | 'name' | 'found';

const SHAPE_HINT_MS = 5000;
const FLARE_MS = 400;
const NOTE_MS = 120;
const DRAG_SNAP_PX = 30;
const FIND_FOV = 70;

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));

const firstPhase = (p: StarMapperProblem): Phase => (p.mode === 'find' ? 'find' : 'draw');

export const StarMapperView: React.FC<StarMapperViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  stars = 0,
  spendStars,
  paused = false,
}) => {
  const t = useTranslation();
  const sm = t.starMapper;
  const texts = sm.constellations as Record<string, ConstellationText | undefined>;
  const starNames = sm.starNames as Record<string, string | undefined>;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const pack = useMemo(
    () => getPackItems<Constellation>(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.id),
    [],
  );
  const constellation = problem.constellation;
  const figure = constellation.lines;
  const nameOf = (id: string) => texts[id]?.name ?? id;

  const surfaceRef = useRef<HTMLDivElement>(null);
  const sceneUtcRef = useRef(problem.sceneUtc);
  const startCamera = (): Camera => {
    const el = surfaceRef.current;
    const aspect = el ? el.clientWidth / Math.max(1, el.clientHeight) : 0.5;
    return {
      ...problem.cameraStart,
      fov: problem.mode === 'find' ? FIND_FOV : fovToFit(problem.figureRadius, aspect),
    };
  };
  const { cameraRef, glideTo, step, bind, movedRef } = useSkyCamera(
    { ...problem.cameraStart, fov: FIND_FOV },
    reducedMotion,
    surfaceRef,
  );

  const [phase, setPhase] = useState<Phase>(firstPhase(problem));
  const [drawing, setDrawing] = useState<Drawing>(EMPTY_DRAWING);
  const [selected, setSelected] = useState<number | null>(null);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [shapeShown, setShapeShown] = useState(false);
  const [hop, setHop] = useState(false);
  const [wrongNames, setWrongNames] = useState<ReadonlySet<string>>(new Set());
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [atlasCard, setAtlasCard] = useState<string | null>(null);
  const [flare, setFlare] = useState(false);
  const [webgl, setWebgl] = useState<'loading' | 'ready' | 'failed'>('loading');

  const answerLock = useAnswerLock(problem.uid);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const frameRef = useRef<((frame: OverlayFrame) => void) | null>(null);
  const positionsRef = useRef(new Map<number, ScreenPoint>());
  const dragRef = useRef<DragLine | null>(null);
  const sizeRef = useRef({ width: 1, height: 1 });
  const firstProblem = useRef(true);
  const beforeAtlasRef = useRef<Camera | null>(null);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  // A new problem: reset this task's state while the sky stays mounted.
  const [syncedUid, setSyncedUid] = useState(problem.uid);
  if (syncedUid !== problem.uid) {
    setSyncedUid(problem.uid);
    setPhase(firstPhase(problem));
    setDrawing(EMPTY_DRAWING);
    setSelected(null);
    setHintsOpen(false);
    setShapeShown(false);
    setHop(false);
    setWrongNames(new Set());
    setAtlasOpen(false);
    setAtlasCard(null);
    setFlare(false);
  }

  useEffect(() => {
    sceneUtcRef.current = problem.sceneUtc;
    if (firstProblem.current) {
      firstProblem.current = false;
      cameraRef.current = startCamera();
    } else {
      glideTo(startCamera());
    }
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      timers.current = [];
    };
    // Only a new problem moves the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.uid]);

  const onFrame = useCallback(
    (timeMs: number, size: { width: number; height: number }) => {
      sizeRef.current = size;
      step(timeMs);
      frameRef.current?.({
        camera: cameraRef.current,
        sceneUtc: sceneUtcRef.current,
        width: size.width,
        height: size.height,
      });
    },
    [cameraRef, step],
  );

  const tracedIds = useMemo(() => {
    const ids = new Set(problem.tracedIds);
    if (phase === 'found') ids.add(constellation.id);
    return ids;
  }, [problem.tracedIds, phase, constellation.id]);

  const finishFigure = (completed: Drawing) => {
    setDrawing(completed);
    setSelected(null);
    setPhase('complete');
    setHintsOpen(false);
    if (!reducedMotion) {
      setFlare(true);
      later(() => setFlare(false), FLARE_MS);
    }
    const order = starOrder(figure);
    order.forEach((_, i) => later(() => playScaleNote(i, soundEnabled), i * NOTE_MS));
    later(
      () => {
        playChord(soundEnabled);
        setPhase(problem.mode === 'draw_name' ? 'name' : 'found');
      },
      order.length * NOTE_MS + 200,
    );
  };

  const connect = (a: number, b: number, from: Drawing = drawing) => {
    if (phase !== 'draw') return;
    const { drawing: next, result } = addLine(from, figure, [a, b]);
    if (result === 'same-star' || result === 'repeat') return;
    if (isComplete(next, figure)) {
      finishFigure(next);
      return;
    }
    if (countLinesLeft(next, figure) <= 0) {
      playSound('error', soundEnabled);
      setDrawing(EMPTY_DRAWING);
      setSelected(null);
      onAnswer(false);
      return;
    }
    playSound(result === 'right' ? 'connect' : 'error', soundEnabled);
    setDrawing(next);
    setSelected(b);
  };

  const activateStar = (hip: number) => {
    if (phase !== 'draw') return;
    if (selected === null) {
      playSound('tap', soundEnabled);
      setSelected(hip);
    } else if (selected === hip) {
      setSelected(null);
    } else {
      connect(selected, hip);
    }
  };

  const localPoint = (e: React.PointerEvent) => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
  };

  const nearestStar = (x: number, y: number): number | null => {
    let best: number | null = null;
    let bestD = DRAG_SNAP_PX;
    for (const [hip, p] of positionsRef.current) {
      if (!p.visible) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) {
        bestD = d;
        best = hip;
      }
    }
    return best;
  };

  const onStarPointerDown = (hip: number, e: React.PointerEvent<SVGGElement>): boolean => {
    if (phase !== 'draw') return false;
    const svg = e.currentTarget.ownerSVGElement;
    capturePointer(svg, e.pointerId);
    // Touch targets of close stars overlap; the star nearest the finger wins.
    const point = localPoint(e);
    dragRef.current = {
      fromHip: nearestStar(point.x, point.y) ?? hip,
      pointerId: e.pointerId,
      ...point,
    };
    return true;
  };

  const tapFind = (x: number, y: number) => {
    const { width, height } = sizeRef.current;
    const tap = unproject(x, y, cameraRef.current, width, height);
    const centre = applyMat3(
      skyMatrix(sceneUtcRef.current),
      equatorialVector(constellation.centre.ra, constellation.centre.dec),
    );
    if (angleBetween(tap, centre) <= problem.figureRadius + 4) {
      playSound('success', soundEnabled);
      setPhase('draw');
      setHintsOpen(false);
      setHop(false);
      glideTo(cameraFacing(centre, fovToFit(problem.figureRadius, width / Math.max(1, height))));
    } else {
      playSound('tap', soundEnabled);
    }
  };

  const backgroundProps: React.SVGProps<SVGSVGElement> = {
    onPointerDown: (e) => {
      if (dragRef.current) return;
      bind.onPointerDown(e);
    },
    onPointerMove: (e) => {
      const drag = dragRef.current;
      if (drag) {
        if (e.pointerId === drag.pointerId) dragRef.current = { ...drag, ...localPoint(e) };
        return;
      }
      bind.onPointerMove(e);
    },
    onPointerUp: (e) => {
      const drag = dragRef.current;
      if (drag) {
        if (e.pointerId !== drag.pointerId) return;
        dragRef.current = null;
        const { x, y } = localPoint(e);
        const end = nearestStar(x, y);
        if (end !== null && end !== drag.fromHip) connect(drag.fromHip, end);
        else activateStar(drag.fromHip);
        return;
      }
      bind.onPointerUp(e);
      if (!movedRef.current && phase === 'find' && !atlasOpen) {
        const { x, y } = localPoint(e);
        tapFind(x, y);
      }
    },
    onPointerCancel: (e) => {
      dragRef.current = null;
      bind.onPointerCancel(e);
    },
    onKeyDown: bind.onKeyDown,
  };

  const applyHint = (id: string, cost: number) => {
    const line = id === 'nextLine' ? nextMissingLine(drawing, figure) : null;
    if (!spendStars || (id === 'nextLine' && (!line || phase !== 'draw'))) return;
    if (!spendStars(cost)) return;
    setHintsOpen(false);
    // The bought line also clears the wrong ones, so it can never use up the last line.
    if (line) connect(line[0], line[1], { lines: drawing.lines.filter((d) => d.right) });
    if (id === 'shape') {
      setShapeShown(true);
      later(() => setShapeShown(false), SHAPE_HINT_MS);
    }
    if (id === 'hop') setHop(true);
  };

  const chooseName = (id: string) => {
    if (id === problem.correctAnswer) {
      playSound('success', soundEnabled);
      setPhase('found');
    } else {
      playSound('error', soundEnabled);
      setWrongNames((prev) => new Set(prev).add(id));
      onAnswer(false);
    }
  };

  const next = () => {
    if (answerLock.lock()) onAnswer(true);
  };

  const openAtlas = () => {
    setAtlasOpen(true);
    setHintsOpen(false);
    const c = cameraRef.current;
    beforeAtlasRef.current = { ...c };
    glideTo({ yaw: c.yaw, pitch: Math.max(c.pitch, 35), fov: 100 });
  };

  const closeAtlas = () => {
    setAtlasOpen(false);
    setAtlasCard(null);
    glideTo(beforeAtlasRef.current ?? startCamera());
  };

  const monthName = (month: number) => sm.months[month - 1] ?? '';
  const local = estonianLocal(problem.sceneUtc);
  const moment = fill(local.hour < 12 ? sm.momentNight : sm.moment, {
    month: monthName(local.month),
    hour: local.hour,
  });
  // A found constellation in Leia taevast is then drawn from memory.
  const taskKey = {
    draw: 'draw',
    draw_name: 'drawUnnamed',
    memory: 'memory',
    find: phase === 'find' ? 'find' : 'memory',
  } as const satisfies Record<StarMapperProblem['mode'], keyof typeof sm.task>;
  const task = fill(sm.task[taskKey[problem.mode]], { name: nameOf(constellation.id) });

  const cardText = (c: Constellation) => ({
    text: texts[c.id] ?? { name: c.id, desc: '' },
    when: c.circumpolar
      ? sm.bestSeenAlways
      : fill(sm.bestSeen, { month: monthName(c.bestEvening.month).toLowerCase() }),
    source: c.folkSource ? fill(sm.source, { title: c.folkSource.title }) : null,
  });
  const atlasConstellation = atlasCard ? pack.find((p) => p.id === atlasCard) : undefined;

  const showGuide = problem.showGuide || shapeShown;
  const figureHips = useMemo(() => new Set(starOrder(figure)), [figure]);
  const atlasFigures = useMemo<AtlasFigure[] | null>(
    () =>
      atlasOpen
        ? pack.map((c) => ({
            id: c.id,
            name: texts[c.id]?.name ?? c.id,
            lines: c.lines,
            centre: c.centre,
            // While it is being looked for, the target stays dark in the atlas.
            found: tracedIds.has(c.id) && !(phase === 'find' && c.id === constellation.id),
          }))
        : null,
    [atlasOpen, pack, texts, tracedIds, phase, constellation.id],
  );
  const hopLine = useMemo(
    () => (hop && phase === 'find' ? starHop(constellation, pack) : null),
    [hop, phase, constellation, pack],
  );
  const rightLines = drawing.lines.filter((d) => d.right).map((d) => d.line);
  const wrongLines = drawing.lines.filter((d) => !d.right).map((d) => d.line);
  const starLabel = (s: SkyStar, i: number) => {
    const base = starNames[String(s.hip)]
      ? fill(sm.starLabel, { name: starNames[String(s.hip)] ?? '' })
      : fill(sm.starNumber, { n: i + 1 });
    return s.hip === selected ? `${base}, ${sm.selected}` : base;
  };
  const left = countLinesLeft(drawing, figure);
  const hints = (STAR_MAPPER_CONFIG.paidHints ?? [])
    .filter((h) => (h.id !== 'nextLine' && h.id !== 'shape') || phase === 'draw')
    .filter((h) => h.id !== 'hop' || (problem.mode === 'find' && phase === 'find'))
    .map((h) => ({ id: h.id, label: sm.hints[h.id as keyof typeof sm.hints], cost: h.cost }));
  const drawingVisible = phase !== 'find' && !atlasOpen;

  return (
    <div
      ref={surfaceRef}
      className="sky-stage absolute inset-0 overflow-hidden"
      data-webgl={webgl}
      data-phase={phase}
    >
      <SkyCanvas
        cameraRef={cameraRef}
        sceneUtcRef={sceneUtcRef}
        paused={paused}
        reducedMotion={reducedMotion}
        onFrame={onFrame}
        onStatus={setWebgl}
      />
      {atlasOpen && <div className="sky-dim pointer-events-none absolute inset-0" />}
      <SkyOverlay
        stars={drawingVisible ? problem.stars : []}
        starLabel={starLabel}
        showDots={webgl !== 'ready'}
        drawnLines={drawingVisible || phase === 'found' ? rightLines : []}
        wrongLines={drawingVisible ? wrongLines : []}
        guideLines={drawingVisible && showGuide ? figure : null}
        ringHips={drawingVisible && problem.showGuide ? figureHips : null}
        selectedHip={selected}
        hop={hopLine}
        atlas={atlasFigures}
        directions={sm.directions}
        flare={flare}
        frameRef={frameRef}
        positionsRef={positionsRef}
        dragRef={dragRef}
        onStarPointerDown={onStarPointerDown}
        onStarActivate={activateStar}
        onAtlasOpen={(id) => setAtlasCard(id)}
        backgroundProps={backgroundProps}
        ariaLabel={atlasOpen ? sm.mySky : task}
      />

      {atlasOpen ? (
        <AtlasPanel
          title={sm.mySky}
          closeLabel={sm.close}
          seasonLabels={sm.seasons}
          items={pack}
          foundIds={tracedIds}
          onClose={closeAtlas}
        />
      ) : (
        <TopPanel
          task={phase === 'found' || phase === 'complete' ? sm.wellDrawn : task}
          moment={moment}
        />
      )}

      {!atlasOpen && hintsOpen && (phase === 'draw' || phase === 'find') && (
        <HintRow hints={hints} stars={stars} onHint={applyHint} />
      )}
      {!atlasOpen && phase === 'name' && (
        <NameSheet
          question={sm.nameQuestion}
          options={(problem.options ?? []).map((id) => ({ id, name: nameOf(id) }))}
          wrongIds={wrongNames}
          onChoose={chooseName}
        />
      )}

      {phase !== 'found' && !atlasCard && (
        <BottomBar
          linesLeft={phase === 'draw' ? left : null}
          linesLabel={left === 1 ? sm.linesLeftOne : fill(sm.linesLeft, { count: left })}
          undoLabel={sm.undo}
          canUndo={drawing.lines.length > 0}
          onUndo={() => {
            setDrawing(undoLine(drawing));
            setSelected(null);
          }}
          hintLabel={sm.hint}
          hintsOpen={hintsOpen}
          canHint={!atlasOpen && !!spendStars && (phase === 'draw' || phase === 'find')}
          onHints={() => setHintsOpen((o) => !o)}
          mySkyLabel={sm.mySky}
          onMySky={atlasOpen ? closeAtlas : openAtlas}
        />
      )}

      {phase === 'found' && !atlasOpen && (
        <FoundCard
          heading={sm.found}
          {...cardText(constellation)}
          actionLabel={sm.next}
          primary
          onAction={next}
        />
      )}
      {atlasConstellation && (
        <FoundCard
          heading={sm.mySky}
          {...cardText(atlasConstellation)}
          actionLabel={sm.close}
          primary={false}
          onAction={() => setAtlasCard(null)}
        />
      )}
    </div>
  );
};
