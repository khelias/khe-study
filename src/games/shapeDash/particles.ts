import { PLAYER_SIZE } from './layout';
import type { Particle } from './runState';

export function createExplosionParticles(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const speed = 100 + Math.random() * 150;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      size: 3 + Math.random() * 4,
      color,
      type: 'explosion',
    });
  }
  return particles;
}

export function createLandParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const speed = 50 + Math.random() * 80;
    particles.push({
      x: x + Math.random() * PLAYER_SIZE,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5,
      maxLife: 0.5,
      size: 2 + Math.random() * 3,
      color: '#888888',
      type: 'landing',
    });
  }
  return particles;
}

export function createFireworkParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  const colors = ['#00ff88', '#00ffcc', '#ffcc00', '#ff6600', '#cc44ff'];
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    const speed = 120 + Math.random() * 100;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.2,
      maxLife: 1.2,
      size: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      type: 'firework',
    });
  }
  return particles;
}

export function createSparkleParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  const colors = ['#fef08a', '#facc15', '#eab308', '#fbbf24'];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const speed = 80 + Math.random() * 60;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.8,
      maxLife: 0.8,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      type: 'sparkle',
    });
  }
  return particles;
}

export function createScorePopup(x: number, y: number, score: number, combo: number): Particle[] {
  return [
    {
      x,
      y,
      vx: 0,
      vy: -60,
      life: 1.5,
      maxLife: 1.5,
      size: 16,
      color: combo > 1 ? '#fef08a' : '#ffffff',
      type: 'score',
      text: `+${score}${combo > 1 ? ` (${combo}x)` : ''}`,
    },
  ];
}

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => {
      const newP = { ...p };
      newP.x += newP.vx * dt;
      newP.y += newP.vy * dt;
      newP.vy += 300 * dt;
      newP.life -= dt;
      return newP;
    })
    .filter((p) => p.life > 0);
}
