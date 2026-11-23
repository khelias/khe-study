import { describe, expect, it } from 'vitest';
import {
  createExplosionParticles,
  createFireworkParticles,
  createLandParticles,
  createScorePopup,
  createSparkleParticles,
  updateParticles,
} from '../particles';

describe('shapeDash particles', () => {
  it('creates expected counts and types for each particle factory', () => {
    const explosion = createExplosionParticles(10, 20, '#00ff88');
    expect(explosion).toHaveLength(24);
    expect(explosion.every((p) => p.type === 'explosion' && p.color === '#00ff88')).toBe(true);

    const landing = createLandParticles(10, 300);
    expect(landing).toHaveLength(6);
    expect(landing.every((p) => p.type === 'landing')).toBe(true);

    const firework = createFireworkParticles(200, 100);
    expect(firework).toHaveLength(32);
    expect(firework.every((p) => p.type === 'firework')).toBe(true);

    const sparkle = createSparkleParticles(50, 50);
    expect(sparkle).toHaveLength(16);
    expect(sparkle.every((p) => p.type === 'sparkle')).toBe(true);
  });

  it('formats score popups with and without a combo multiplier', () => {
    const plain = createScorePopup(10, 20, 25, 1);
    expect(plain).toHaveLength(1);
    expect(plain[0]?.text).toBe('+25');
    expect(plain[0]?.color).toBe('#ffffff');

    const combo = createScorePopup(10, 20, 50, 3);
    expect(combo[0]?.text).toBe('+50 (3x)');
    expect(combo[0]?.color).toBe('#fef08a');
  });

  it('advances physics, applies gravity, and drops expired particles', () => {
    const updated = updateParticles(
      [
        {
          x: 10,
          y: 20,
          vx: 100,
          vy: -50,
          life: 1,
          maxLife: 1,
          size: 4,
          color: '#ffffff',
          type: 'sparkle',
        },
        {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          life: 0.05,
          maxLife: 0.5,
          size: 2,
          color: '#888888',
          type: 'landing',
        },
      ],
      0.1,
    );

    expect(updated).toHaveLength(1);
    expect(updated[0]?.x).toBeCloseTo(20);
    expect(updated[0]?.y).toBeCloseTo(15);
    expect(updated[0]?.vy).toBeCloseTo(-20);
    expect(updated[0]?.life).toBeCloseTo(0.9);
  });
});
