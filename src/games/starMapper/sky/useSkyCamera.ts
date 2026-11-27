import { useCallback, useEffect, useRef } from 'react';
import {
  clamp,
  easeOut,
  FOV_MAX,
  FOV_MIN,
  PITCH_MAX,
  PITCH_MIN,
  wrap360,
  yawDelta,
  type Camera,
} from './astro';

const GLIDE_MS = 600;
const FRICTION_PER_MS = 0.004;
const KEY_STEP = 5;

interface Glide {
  from: Camera;
  to: Camera;
  start: number;
}

export interface SkyCameraControls {
  cameraRef: React.RefObject<Camera>;
  /** Move to a camera: a 600 ms glide, or a cut under reduced motion. */
  glideTo: (to: Camera) => void;
  /** Advance inertia and glides; called once per frame by the frame loop. */
  step: (timeMs: number) => void;
  /** Pointer handlers for the sky's background (not the stars). */
  bind: {
    onPointerDown: (e: React.PointerEvent<Element>) => void;
    onPointerMove: (e: React.PointerEvent<Element>) => void;
    onPointerUp: (e: React.PointerEvent<Element>) => void;
    onPointerCancel: (e: React.PointerEvent<Element>) => void;
    onKeyDown: (e: React.KeyboardEvent<Element>) => void;
  };
  /** True when the last pointer gesture moved the sky (so a tap is not a tap). */
  movedRef: React.RefObject<boolean>;
}

/** Pointer capture, which a pointer that is no longer active refuses. */
export function capturePointer(el: Element | null | undefined, pointerId: number): void {
  try {
    el?.setPointerCapture?.(pointerId);
  } catch {
    // The pointer ended before the capture; the gesture works without it.
  }
}

/** Drag, inertia, pinch, wheel and arrow keys over the sky, plus glides. */
export function useSkyCamera(
  initial: Camera,
  reducedMotion: boolean,
  surfaceRef: React.RefObject<HTMLElement | null>,
): SkyCameraControls {
  const cameraRef = useRef<Camera>(initial);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const velocity = useRef({ yaw: 0, pitch: 0 });
  const lastMove = useRef(0);
  const glide = useRef<Glide | null>(null);
  const lastStep = useRef(0);
  const movedRef = useRef(false);
  const pinchDistance = useRef(0);
  const reducedRef = useRef(reducedMotion);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  const set = useCallback((next: Camera) => {
    cameraRef.current = {
      yaw: wrap360(next.yaw),
      pitch: clamp(next.pitch, PITCH_MIN, PITCH_MAX),
      fov: clamp(next.fov, FOV_MIN, FOV_MAX),
    };
  }, []);

  const glideTo = useCallback(
    (to: Camera) => {
      velocity.current = { yaw: 0, pitch: 0 };
      if (reducedRef.current) {
        glide.current = null;
        set(to);
        return;
      }
      glide.current = { from: { ...cameraRef.current }, to, start: performance.now() };
    },
    [set],
  );

  const step = useCallback(
    (timeMs: number) => {
      const dt = lastStep.current ? Math.min(64, timeMs - lastStep.current) : 16;
      lastStep.current = timeMs;
      const g = glide.current;
      if (g) {
        const t = clamp((performance.now() - g.start) / GLIDE_MS, 0, 1);
        const k = easeOut(t);
        set({
          yaw: g.from.yaw + yawDelta(g.from.yaw, g.to.yaw) * k,
          pitch: g.from.pitch + (g.to.pitch - g.from.pitch) * k,
          fov: g.from.fov + (g.to.fov - g.from.fov) * k,
        });
        if (t >= 1) glide.current = null;
        return;
      }
      if (pointers.current.size > 0 || reducedRef.current) return;
      const v = velocity.current;
      if (Math.abs(v.yaw) + Math.abs(v.pitch) < 0.0005) return;
      const c = cameraRef.current;
      set({ yaw: c.yaw + v.yaw * dt, pitch: c.pitch + v.pitch * dt, fov: c.fov });
      const decay = Math.exp(-FRICTION_PER_MS * dt);
      velocity.current = { yaw: v.yaw * decay, pitch: v.pitch * decay };
    },
    [set],
  );

  const degPerPx = () =>
    cameraRef.current.fov / Math.max(1, surfaceRef.current?.clientHeight ?? 600);

  const zoom = useCallback(
    (factor: number) => {
      const c = cameraRef.current;
      set({ ...c, fov: c.fov * factor });
    },
    [set],
  );

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // A card or panel over the sky scrolls itself.
      if (
        e.target instanceof Element &&
        e.target.closest('.sky-card, .sky-panel, .sky-bar, .sky-treasure-card')
      )
        return;
      e.preventDefault();
      glide.current = null;
      zoom(Math.exp(e.deltaY * 0.0012));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [surfaceRef, zoom]);

  const onPointerDown = (e: React.PointerEvent<Element>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    capturePointer(e.currentTarget, e.pointerId);
    glide.current = null;
    velocity.current = { yaw: 0, pitch: 0 };
    movedRef.current = false;
    lastMove.current = performance.now();
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchDistance.current = Math.hypot(a!.x - b!.x, a!.y - b!.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent<Element>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (pinchDistance.current > 0 && d > 0) zoom(pinchDistance.current / d);
      pinchDistance.current = d;
      movedRef.current = true;
      return;
    }
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 0) {
      if (Math.hypot(dx, dy) > 2) movedRef.current = true;
      const k = degPerPx();
      const c = cameraRef.current;
      set({ yaw: c.yaw - dx * k, pitch: c.pitch + dy * k, fov: c.fov });
      const now = performance.now();
      const dt = Math.max(1, now - lastMove.current);
      lastMove.current = now;
      velocity.current = { yaw: (-dx * k) / dt, pitch: (dy * k) / dt };
    }
  };

  const onPointerUp = (e: React.PointerEvent<Element>) => {
    pointers.current.delete(e.pointerId);
    pinchDistance.current = 0;
    if (performance.now() - lastMove.current > 80) velocity.current = { yaw: 0, pitch: 0 };
  };

  const onKeyDown = (e: React.KeyboardEvent<Element>) => {
    const c = cameraRef.current;
    const moves: Record<string, Camera> = {
      ArrowLeft: { ...c, yaw: c.yaw - KEY_STEP },
      ArrowRight: { ...c, yaw: c.yaw + KEY_STEP },
      ArrowUp: { ...c, pitch: c.pitch + KEY_STEP },
      ArrowDown: { ...c, pitch: c.pitch - KEY_STEP },
      '+': { ...c, fov: c.fov / 1.15 },
      '=': { ...c, fov: c.fov / 1.15 },
      '-': { ...c, fov: c.fov * 1.15 },
    };
    const to = moves[e.key];
    if (!to) return;
    e.preventDefault();
    glideTo(to);
  };

  return {
    cameraRef,
    glideTo,
    step,
    movedRef,
    bind: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown },
  };
}
