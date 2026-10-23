import React, { useEffect, useState } from 'react';
import { ConfettiPiece } from './shared/Confetti';

type ParticleType = 'success' | 'star' | 'celebration';

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  offsetX: string;
  offsetXAmount: number;
  offsetY: number;
}

interface ParticleEffectProps {
  type?: ParticleType;
  active?: boolean;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  type = 'success',
  active = false,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setTimeout(() => setParticles([]), 0);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 0.5,
      size: Math.round((8 + Math.random() * 12) * 0.6),
      offsetX: Math.random() > 0.5 ? '-' : '+',
      offsetXAmount: 100 + Math.random() * 50,
      offsetY: 100 + Math.random() * 50,
    }));

    setTimeout(() => setParticles(newParticles), 0);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [active]);

  if (!active || particles.length === 0) return null;

  // A star burst stays in the star colour; success and celebration mix the state colours.
  const colorClass: string | undefined = type === 'star' ? 'bg-star' : undefined;

  // Generate unique keyframe names for each particle with different offsets
  const keyframes: string = particles
    .map((particle) => {
      const offsetX =
        particle.offsetX === '-' ? `-${particle.offsetXAmount}` : `${particle.offsetXAmount}`;
      return `
        @keyframes particle-${particle.id} {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(${offsetX}px, ${particle.offsetY}px) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
      `;
    })
    .join('\n');

  const animationStyle: string = particles
    .map((particle) => {
      return `.particle-${particle.id} { animation: particle-${particle.id} linear forwards; }`;
    })
    .join('\n');

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute particle-${particle.id}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <ConfettiPiece index={particle.id} size={particle.size} colorClass={colorClass} />
        </div>
      ))}
      <style>{`
        ${keyframes}
        ${animationStyle}
      `}</style>
    </div>
  );
};
