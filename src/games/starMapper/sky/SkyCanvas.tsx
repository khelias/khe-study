import React, { useEffect, useRef, useState } from 'react';
import type { SkyRenderer } from './SkyRenderer';
import type { Camera } from './astro';

interface SkyCanvasProps {
  cameraRef: React.RefObject<Camera>;
  sceneUtcRef: React.RefObject<number>;
  paused: boolean;
  reducedMotion: boolean;
  /** Called every frame the sky runs, before it is drawn (camera motion, overlay positions). */
  onFrame: (timeMs: number, size: { width: number; height: number }) => void;
  onStatus?: (status: 'loading' | 'ready' | 'failed') => void;
}

/**
 * Loads the WebGL sky in its own chunk and runs the frame loop. Without WebGL,
 * or until the chunk arrives, the plain gradient below shows through and the
 * overlay plays on it.
 */
export const SkyCanvas: React.FC<SkyCanvasProps> = ({
  cameraRef,
  sceneUtcRef,
  paused,
  reducedMotion,
  onFrame,
  onStatus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SkyRenderer | null>(null);
  const pausedRef = useRef(paused);
  const onFrameRef = useRef(onFrame);
  const sizeRef = useRef({ width: 1, height: 1 });
  const [webgl, setWebgl] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    pausedRef.current = paused;
    onFrameRef.current = onFrame;
  });

  useEffect(() => {
    rendererRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion, webgl]);

  useEffect(() => {
    onStatus?.(webgl);
  }, [onStatus, webgl]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    let cancelled = false;
    let raf = 0;

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      sizeRef.current = { width, height };
      rendererRef.current?.setSize(width, height, window.devicePixelRatio || 1);
    };
    resize();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(container);

    import('./SkyRenderer')
      .then(({ createSkyRenderer }) => {
        if (cancelled) return;
        const renderer = createSkyRenderer(canvas);
        if (!renderer) {
          setWebgl('failed');
          return;
        }
        rendererRef.current = renderer;
        resize();
        setWebgl('ready');
      })
      .catch(() => {
        if (!cancelled) setWebgl('failed');
      });

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current || document.hidden) return;
      onFrameRef.current(time, sizeRef.current);
      const camera = cameraRef.current;
      if (camera) rendererRef.current?.render(camera, sceneUtcRef.current ?? 0, time / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [cameraRef, sceneUtcRef]);

  return (
    <div ref={containerRef} className="sky-gradient absolute inset-0" data-webgl={webgl}>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full ${webgl === 'ready' ? '' : 'invisible'}`}
        aria-hidden
      />
    </div>
  );
};
