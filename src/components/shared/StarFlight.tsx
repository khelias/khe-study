/**
 * A star won in play flies from where it was won to the star counter in the
 * game bar (board 3A frame 5).
 */

import React, { useCallback, useState } from 'react';
import { Star } from 'lucide-react';
import { playMoment } from '../../engine/audio';
import { Z_INDEX } from '../../utils/zIndex';

interface Flight {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

const STAR_SIZE = 28;
/** `.star-flight` in index.css: the chime sounds as the star lands. */
const FLIGHT_S = 0.7;

export function useStarFlight() {
  const [flights, setFlights] = useState<Flight[]>([]);

  /** Flies a star from `from` to the counter, which chimes on its arrival. */
  const fly = useCallback((from: Element, soundEnabled: boolean) => {
    playMoment('star', soundEnabled, FLIGHT_S);
    const counter = document.querySelector('[data-star-counter]');
    if (!counter) return;
    const a = from.getBoundingClientRect();
    const b = counter.getBoundingClientRect();
    const x = a.left + a.width / 2 - STAR_SIZE / 2;
    const y = a.top + a.height / 2 - STAR_SIZE / 2;
    const flight: Flight = {
      id: Date.now() + Math.random(),
      x,
      y,
      dx: b.left + b.width / 2 - STAR_SIZE / 2 - x,
      dy: b.top + b.height / 2 - STAR_SIZE / 2 - y,
    };
    setFlights((all) => [...all, flight]);
  }, []);

  const land = (id: number) => setFlights((all) => all.filter((f) => f.id !== id));

  const stars = flights.map((f) => (
    <Star
      key={f.id}
      data-testid="star-flight"
      size={STAR_SIZE}
      aria-hidden
      onAnimationEnd={() => land(f.id)}
      className="star-flight pointer-events-none fixed fill-star text-star"
      style={
        {
          left: f.x,
          top: f.y,
          zIndex: Z_INDEX.OVERLAYS,
          '--fly-x': `${f.dx}px`,
          '--fly-y': `${f.dy}px`,
        } as React.CSSProperties
      }
    />
  ));

  return { fly, stars };
}
