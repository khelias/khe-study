/**
 * ShapeDashView V4 – Geometry Dash runner with inline shape gates (no modal interruptions)
 *
 * Features:
 * - V4: Shape gate system with inline rendering (no checkpoint modals)
 * - V4: Responsive canvas sizing with aspect ratio preservation
 * - V4: Multi-level terrain rendering with themes
 * - V4: PaidHintButtons integration (reveal gate, slow time)
 * - V3: Neon color theme with glow effects
 * - V3: Particle system (trail, explosion, landing, fireworks)
 * - V3: Animated player with rotation and squash/stretch
 * - V3: Multi-layer parallax background
 * - V3: Pulsing/glowing obstacles
 * - V3: Screen shake effects
 * - V3: HUD with progress bar and stats
 * - V3: Enhanced collision detection
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { playSound } from '../../engine/audio';
import {
  GRAVITY,
  JUMP_VELOCITY,
  SPIKE_WIDTH,
  SPIKE_HEIGHT,
  BLOCK_DEFAULT_HEIGHT,
  JUMP_PAD_BOOST_VELOCITY,
  JUMP_PAD_WIDTH,
  BOOST_ZONE_MULTIPLIER,
  checkStarCollection,
  checkJumpPadContact,
  checkBoostZone,
  checkShapeGatePass,
  getApproachingGateIndex,
  GATE_ZONE_HEIGHT,
  GATE_STACK_GROUND_CLEARANCE,
  getGateLayout,
  hasReachedFinish,
} from '../../engine/shapeDash';
import { useTranslation } from '../../i18n/useTranslation';
import { PaidHintButtons } from '../../components/shared/PaidHintButtons';
import { GAME_CONFIG } from '../data';
import type { ShapeDashProblem } from '../../types/game';

type AnswerHandler = (answer: boolean) => void;

interface ShapeDashViewProps {
  problem: ShapeDashProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

// V4: Responsive canvas with a taller mobile playfield so vertical gate lanes remain playable.
const CANVAS_DESKTOP_ASPECT_RATIO = 16 / 10; // 1.6:1 aspect ratio for wide screens
const CANVAS_MOBILE_ASPECT_RATIO = 1.1;
const CANVAS_MAX_WIDTH = 896; // 4xl max-width
const CANVAS_HEIGHT_BASE = 400;
const CANVAS_MIN_HEIGHT = 236;

const GROUND_DEPTH_MIN = 46;
const GROUND_DEPTH_MAX = 72;
const GATE_TARGET_TOP_MARGIN = 28;
const GATE_MIN_SCALE = 0.78;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getCanvasAspectRatio(width: number): number {
  const narrowProgress = clamp((560 - width) / 240, 0, 1);
  return (
    CANVAS_DESKTOP_ASPECT_RATIO -
    (CANVAS_DESKTOP_ASPECT_RATIO - CANVAS_MOBILE_ASPECT_RATIO) * narrowProgress
  );
}

function getCanvasHeight(width: number, viewportHeight: number): number {
  const targetHeight = width / getCanvasAspectRatio(width);
  const viewportCap =
    viewportHeight > 0 ? Math.max(CANVAS_MIN_HEIGHT, viewportHeight - 84) : CANVAS_HEIGHT_BASE;
  return Math.floor(
    clamp(Math.min(targetHeight, viewportCap), CANVAS_MIN_HEIGHT, CANVAS_HEIGHT_BASE),
  );
}

function getGroundDepth(canvasHeight: number): number {
  return clamp(Math.round(canvasHeight * 0.18), GROUND_DEPTH_MIN, GROUND_DEPTH_MAX);
}

function getGroundY(canvasHeight: number): number {
  return canvasHeight - getGroundDepth(canvasHeight);
}

function getResponsiveGateScale(groundY: number): number {
  const availableHeight = groundY - GATE_TARGET_TOP_MARGIN - GATE_STACK_GROUND_CLEARANCE;
  return clamp(availableHeight / GATE_ZONE_HEIGHT, GATE_MIN_SCALE, 1);
}

const GROUND_Y = getGroundY(CANVAS_HEIGHT_BASE);
const PLAYER_X = 140;
const PLAYER_MIN_X = 76;
const PLAYER_SMALL_SCREEN_RATIO = 0.24;
const PLAYER_SIZE = 42;

// Animation constants
const ROTATION_SPEED = 8; // radians per second during jumps
const SQUASH_STRETCH_DECAY = 0.15; // decay rate per frame
const JUMP_SQUASH = 0.7; // squash amount on jump
const LANDING_STRETCH = 1.3; // stretch amount on landing
const SCREEN_SHAKE_INTENSITY = 8; // pixels
const SCREEN_SHAKE_DECAY = 10; // decay rate per second

// Particle system
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'trail' | 'explosion' | 'landing' | 'firework' | 'sparkle' | 'score';
  text?: string; // For score popups
}

interface ShapeDashLabels {
  attempt: string;
  score: string;
  shield: string;
  oneMoreWrongWarning: string;
  wrongGateNextWarning: string;
}

// Game state (all mutable state in a single ref object)
interface GameState {
  scroll: number;
  playerY: number;
  playerVelY: number;
  playerRotation: number;
  isOnGround: boolean;
  canDoubleJump: boolean;
  gravityFlipped: boolean;
  speedMultiplier: number;
  playerScale: number;
  squashStretch: number;
  screenShake: number;
  attemptCount: number;
  score: number;
  coinsCollected: number;
  pulsePhase: number;
  particles: Particle[];
  trailPoints: Array<{ x: number; y: number }>;
  // V3 additions
  combo: number; // Current combo multiplier (1, 2, 3)
  comboCount: number; // Number of obstacles cleared without hit
  starsCollected: number; // Stars collected this run
  correctAnswerStreak: number; // Consecutive correct checkpoint answers (legacy)
  hasShield: boolean; // Shield power-up active
  questionTimer: number; // Current question timer (seconds) - not used in V4
  collectedStarIds: Set<string>; // Track which stars collected
  bestScore: number; // Best score achieved
  totalStars: number; // Total stars in the run
  // V4 additions
  passedGateIds: Set<string>; // Track which gates have been passed
  passedObstacleIndices: Set<number>; // Track which obstacles have been passed (for combo)
  consecutiveWrongGates: number; // Track consecutive wrong gates for crash mechanic
  revealedGateId: string | null; // ID of gate revealed by hint
  slowTimeUntil: number; // Timestamp when slow time effect ends
  feedbackMessage: string | null; // Feedback message to display
  feedbackType: 'correct' | 'wrong' | 'warning' | null; // Type of feedback
  feedbackUntil: number; // Timestamp when feedback disappears
}

// Particle system helpers
function createExplosionParticles(x: number, y: number, color: string): Particle[] {
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

function createLandParticles(x: number, y: number): Particle[] {
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

function createFireworkParticles(x: number, y: number): Particle[] {
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

// V3: Sparkle particles for star collection
function createSparkleParticles(x: number, y: number): Particle[] {
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

// V3: Score popup particle
function createScorePopup(x: number, y: number, score: number, combo: number): Particle[] {
  return [
    {
      x,
      y,
      vx: 0,
      vy: -60, // Float upward
      life: 1.5,
      maxLife: 1.5,
      size: 16,
      color: combo > 1 ? '#fef08a' : '#ffffff',
      type: 'score',
      text: `+${score}${combo > 1 ? ` (${combo}x)` : ''}`,
    },
  ];
}

function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => {
      const newP = { ...p };
      newP.x += newP.vx * dt;
      newP.y += newP.vy * dt;
      newP.vy += 300 * dt; // Gravity on particles
      newP.life -= dt;
      return newP;
    })
    .filter((p) => p.life > 0);
}

function getPlayerX(canvasWidth: number): number {
  return Math.min(
    PLAYER_X,
    Math.max(PLAYER_MIN_X, Math.floor(canvasWidth * PLAYER_SMALL_SCREEN_RATIO)),
  );
}

// Rendering functions
function drawBackground(
  ctx: CanvasRenderingContext2D,
  scroll: number,
  pulsePhase: number,
  width: number,
  height: number,
  groundY: number,
) {
  // Dark background gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#0a0a1a');
  skyGrad.addColorStop(0.5, '#1a1a3a');
  skyGrad.addColorStop(1, '#2a2a4a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, groundY);

  // Layer 1: Distant stars (0.05x scroll speed)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const starOffset = (scroll * 0.05) % 100;
  for (let i = 0; i < 30; i++) {
    const x = ((i * 73) % width) - starOffset;
    const y = (i * 41) % groundY;
    ctx.fillRect(x, y, 2, 2);
  }

  // Layer 2: Geometric grid (0.15x scroll speed)
  const gridOffset = (scroll * 0.15) % 60;
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
  ctx.lineWidth = 1;
  for (let x = -gridOffset; x < width + 60; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, groundY);
    ctx.stroke();
  }
  for (let y = 0; y < groundY; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Layer 3: Floating shapes (0.1x speed with rotation)
  const shapeOffset = (scroll * 0.1) % 150;
  ctx.strokeStyle = 'rgba(0, 255, 204, 0.15)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const x = ((i * 120) % width) - shapeOffset;
    const y = 50 + ((i * 60) % (groundY - 100));
    const rot = pulsePhase * 0.5 + i;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (i % 3 === 0) {
      // Triangle
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(13, 15);
      ctx.lineTo(-13, 15);
      ctx.closePath();
      ctx.stroke();
    } else if (i % 3 === 1) {
      // Square
      ctx.strokeRect(-12, -12, 24, 24);
    } else {
      // Circle
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Ground with stripes
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(0, groundY, width, height - groundY);
  const stripeOffset = (scroll * 0.5) % 40;
  ctx.fillStyle = 'rgba(0, 255, 136, 0.08)';
  for (let sx = -stripeOffset; sx < width + 40; sx += 40) {
    ctx.fillRect(sx, groundY, 20, height - groundY);
  }

  // Ground line with neon glow
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  squashStretch: number,
  _scale: number, // Reserved for future mini/mega portal modes
  pulsePhase: number,
  hasShield: boolean = false,
) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate(rotation);
  ctx.scale(1, squashStretch);

  // V3: Shield glow effect
  if (hasShield) {
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 24 + Math.sin(pulsePhase * 6) * 8;
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 4;
    ctx.strokeRect(-size / 2 - 8, -size / 2 - 8, size + 16, size + 16);
  }

  // Neon glow (pulses)
  const glowIntensity = 12 + Math.sin(pulsePhase * 4) * 4;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = glowIntensity;

  // Player body
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(-size / 2, -size / 2, size, size);

  // Inner highlight
  ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
  ctx.fillRect(-size / 2 + 6, -size / 2 + 6, size - 12, size - 12);

  // Face (eyes)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0a0a1a';
  const eyeY = -size / 4;
  const eyeSize = 6;
  ctx.fillRect(-size / 3, eyeY, eyeSize, eyeSize);
  ctx.fillRect(size / 3 - eyeSize, eyeY, eyeSize, eyeSize);

  // Eye highlights
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(-size / 3 + 1, eyeY + 1, 2, 2);
  ctx.fillRect(size / 3 - eyeSize + 1, eyeY + 1, 2, 2);

  ctx.restore();
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: Array<{ x: number; y: number }>,
  size: number,
) {
  const colors = ['#ff0088', '#ff8800', '#ffff00', '#00ff88', '#0088ff', '#8800ff'];
  for (let i = 0; i < trail.length; i++) {
    const t = trail[i];
    if (!t) continue;
    const alpha = (i / trail.length) * 0.5;
    const colorIdx = Math.floor((i / trail.length) * colors.length);
    const hexColor = colors[colorIdx] || colors[0]!;
    // Convert hex to rgba
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    const trailSize = (size * (i / trail.length)) / 2;
    ctx.fillRect(
      t.x + size / 2 - trailSize / 2,
      t.y + size / 2 - trailSize / 2,
      trailSize,
      trailSize,
    );
  }
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  type: string,
  screenX: number,
  groundY: number,
  offsetY: number,
  height: number,
  radius: number,
  pulsePhase: number,
) {
  const pulse = 1 + Math.sin(pulsePhase * 3) * 0.03;
  const glowBlur = 12 + Math.sin(pulsePhase * 2) * 4;

  if (type === 'circle') {
    const cx = screenX + radius;
    const cy = groundY - radius - offsetY;
    ctx.shadowColor = '#cc44ff';
    ctx.shadowBlur = glowBlur;
    ctx.fillStyle = '#cc44ff';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(cx - radius / 3, cy - radius / 3, radius / 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'floating') {
    const top = groundY - height - offsetY;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = glowBlur;
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(screenX, top, SPIKE_WIDTH * pulse, height * pulse);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(screenX + 4, top + 4, SPIKE_WIDTH * pulse - 8, height * pulse - 8);
  } else if (type === 'spike') {
    const top = groundY - height - offsetY;
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = glowBlur;
    ctx.fillStyle = '#ff3366';
    ctx.beginPath();
    ctx.moveTo(screenX, groundY - offsetY);
    ctx.lineTo(screenX + (SPIKE_WIDTH * pulse) / 2, top);
    ctx.lineTo(screenX + SPIKE_WIDTH * pulse, groundY - offsetY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // block
    const top = groundY - height - offsetY;
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = glowBlur;
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(screenX, top, SPIKE_WIDTH * pulse, height * pulse);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(screenX + 4, top + 4, SPIKE_WIDTH * pulse - 8, height * pulse - 8);
  }
}

// V3: Draw collectible star
function drawStar(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  pulsePhase: number,
  collected: boolean,
) {
  if (collected) return;

  const STAR_SIZE = 16;
  const STAR_POINTS = 10; // 5 outer points + 5 inner points
  const STAR_ROTATION_OFFSET = -Math.PI / 2; // Point star upward
  const STAR_INNER_RADIUS_RATIO = 0.4;

  const pulse = 1 + Math.sin(pulsePhase * 5) * 0.15;
  const rotation = pulsePhase * 2;

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(rotation);
  ctx.scale(pulse, pulse);

  // Glow
  ctx.shadowColor = '#fef08a';
  ctx.shadowBlur = 16;

  // Draw 5-pointed star (10 points total: alternating outer and inner)
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  for (let i = 0; i < STAR_POINTS; i++) {
    const angle = (i * Math.PI) / 5 + STAR_ROTATION_OFFSET; // 10 points = 2π/10 = π/5
    const r = i % 2 === 0 ? STAR_SIZE : STAR_SIZE * STAR_INNER_RADIUS_RATIO;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Inner highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-3, -3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// V3: Draw jump pad
function drawJumpPad(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  groundY: number,
  pulsePhase: number,
) {
  const width = JUMP_PAD_WIDTH;
  const height = 12;
  const pulse = 1 + Math.sin(pulsePhase * 4) * 0.08;

  // Glow
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 20;

  // Platform
  ctx.fillStyle = '#00ffcc';
  ctx.fillRect(screenX, groundY - height * pulse, width, height * pulse);

  ctx.shadowBlur = 0;

  // Upward arrows
  ctx.strokeStyle = '#0a0a1a';
  ctx.lineWidth = 2;
  const arrowSpacing = width / 3;
  for (let i = 0; i < 3; i++) {
    const ax = screenX + arrowSpacing / 2 + i * arrowSpacing;
    const ay = groundY - height - 8;
    ctx.beginPath();
    ctx.moveTo(ax - 4, ay + 4);
    ctx.lineTo(ax, ay);
    ctx.lineTo(ax + 4, ay + 4);
    ctx.stroke();
  }
}

// V3: Draw boost zone
function drawBoostZone(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  groundY: number,
  width: number,
  pulsePhase: number,
) {
  const height = 4;

  // Neon streak effect
  const gradient = ctx.createLinearGradient(screenX, 0, screenX + width, 0);
  gradient.addColorStop(0, 'rgba(255, 102, 0, 0)');
  gradient.addColorStop(0.5, 'rgba(255, 102, 0, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 102, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(screenX, groundY, width, height);

  // Moving streak lines
  const streakOffset = (pulsePhase * 200) % 30;
  ctx.strokeStyle = 'rgba(255, 204, 0, 0.8)';
  ctx.lineWidth = 2;
  for (let x = screenX - streakOffset; x < screenX + width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + 20, groundY);
    ctx.stroke();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;

    // V3: Handle score popup text particles differently
    if (p.type === 'score' && p.text) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    } else {
      // Regular particle rendering
      ctx.fillStyle = p.color.includes('rgba')
        ? p.color.replace(/[\d.]+\)$/g, `${alpha})`)
        : p.color +
          `${Math.floor(alpha * 255)
            .toString(16)
            .padStart(2, '0')}`;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
}

// V4: Draw shape based on type
function drawShape(
  ctx: CanvasRenderingContext2D,
  type: 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'circle',
  cx: number,
  cy: number,
  size: number,
  color: string,
  glow: boolean = false,
) {
  ctx.save();

  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
  }

  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  switch (type) {
    case 'triangle': {
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size * 0.866, cy + size * 0.5);
      ctx.lineTo(cx - size * 0.866, cy + size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'square': {
      ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
      ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
      break;
    }
    case 'pentagon': {
      const sides = 5;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'hexagon': {
      const sides = 6;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

// V4: Draw shape gate zone (3 vertical lanes selected by jump height)
function drawShapeGates(
  ctx: CanvasRenderingContext2D,
  gate: {
    id: string;
    x: number;
    prompt: string;
    shapes: Array<{
      type: 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'circle';
      label: string;
      isCorrect: boolean;
    }>;
  },
  scrollOffset: number,
  groundY: number,
  gateScale: number,
  pulsePhase: number,
  revealed: boolean = false,
) {
  const gateScreenX = gate.x - scrollOffset;
  const gateLayout = getGateLayout(groundY, gateScale);
  const gateX = gateScreenX - gateLayout.width / 2;
  const startY = gateLayout.stackTopY;

  for (let i = 0; i < 3; i++) {
    const shape = gate.shapes[i];
    if (!shape) continue;

    const gateY = startY + i * (gateLayout.height + gateLayout.spacing);
    const gateCenterX = gateX + gateLayout.width / 2;
    const gateCenterY = gateY + gateLayout.height / 2;

    // Draw gate frame
    const isCorrect = shape.isCorrect;
    const frameColor = revealed && isCorrect ? '#00ff88' : '#00ffcc';
    const pulse = revealed && isCorrect ? 1 + Math.sin(pulsePhase * 8) * 0.15 : 1;

    ctx.save();

    if (revealed && isCorrect) {
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 32 * pulse;
    }

    ctx.strokeStyle = frameColor;
    ctx.lineWidth = Math.max(2.5, 4 * gateScale);
    ctx.strokeRect(gateX, gateY, gateLayout.width, gateLayout.height);

    ctx.restore();

    // Draw shape inside gate
    const shapeSize = 15 * gateScale;
    const shapeColor = revealed && isCorrect ? '#00ff88' : '#00ffcc';
    drawShape(
      ctx,
      shape.type,
      gateCenterX,
      gateCenterY,
      shapeSize,
      shapeColor,
      revealed && isCorrect,
    );

    // Draw label below shape
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(10, 12 * gateScale)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(shape.label, gateCenterX, gateY + gateLayout.height - 8 * gateScale);
  }
}

// V4: Draw gate approaching warning
function drawGateWarning(
  ctx: CanvasRenderingContext2D,
  prompt: string,
  width: number,
  pulsePhase: number,
  consecutiveWrong: number,
  labels: Pick<ShapeDashLabels, 'oneMoreWrongWarning' | 'wrongGateNextWarning'>,
) {
  const pulse = 1 + Math.sin(pulsePhase * 4) * 0.1;

  // Warning background
  const bgAlpha = consecutiveWrong >= 1 ? 0.3 : 0.2;
  const bgColor =
    consecutiveWrong >= 1 ? `rgba(255, 51, 102, ${bgAlpha})` : `rgba(0, 255, 204, ${bgAlpha})`;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 60, width, 60);

  // Border
  ctx.strokeStyle = consecutiveWrong >= 1 ? '#ff3366' : '#00ffcc';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 60, width, 60);

  // Prompt text
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `bold ${18 * pulse}px Arial`;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(prompt, width / 2, 95);
  ctx.fillText(prompt, width / 2, 95);
  ctx.restore();

  // Warning for consecutive wrong gates
  if (consecutiveWrong >= 1) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ff3366';
    const warningText =
      consecutiveWrong === 1 ? labels.oneMoreWrongWarning : labels.wrongGateNextWarning;
    ctx.strokeText(warningText, width / 2, 112);
    ctx.fillText(warningText, width / 2, 112);
    ctx.restore();
  }
}

// V4: Draw feedback message
function drawFeedback(
  ctx: CanvasRenderingContext2D,
  message: string,
  type: 'correct' | 'wrong' | 'warning',
  width: number,
  pulsePhase: number,
) {
  const colors = {
    correct: '#00ff88',
    wrong: '#ff3366',
    warning: '#ffcc00',
  };

  const color = colors[type];
  const pulse = 1 + Math.sin(pulsePhase * 6) * 0.15;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `bold ${24 * pulse}px Arial`;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.strokeText(message, width / 2, 160);
  ctx.fillText(message, width / 2, 160);
  ctx.restore();
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  progress: number,
  attemptCount: number,
  score: number,
  width: number,
  combo: number,
  starsCollected: number,
  totalStars: number,
  hasShield: boolean,
  labels: Pick<ShapeDashLabels, 'attempt' | 'score' | 'shield'>,
  questionTimer?: number,
) {
  // Progress bar
  const barWidth = 200;
  const barHeight = 8;
  const barX = (width - barWidth) / 2;
  const barY = 20;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

  const grad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
  grad.addColorStop(0, '#00ff88');
  grad.addColorStop(1, '#00ffcc');
  ctx.fillStyle = grad;
  ctx.fillRect(barX, barY, barWidth * progress, barHeight);

  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  // Progress percentage
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(progress * 100)}%`, width / 2, barY + barHeight + 16);

  // Attempt counter (left)
  ctx.textAlign = 'left';
  ctx.fillText(`${labels.attempt} ${attemptCount}`, 12, 26);

  // Score (right)
  ctx.textAlign = 'right';
  ctx.fillText(`${labels.score}: ${score}`, width - 12, 26);

  // V3: Combo multiplier (center-right)
  if (combo > 1) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(`${combo}x!`, width / 2 + 100, 50);
    ctx.fillText(`${combo}x!`, width / 2 + 100, 50);
    ctx.restore();
  }

  // V3: Stars collected (left below attempt)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fef08a';
  ctx.fillText(`⭐ ${starsCollected}/${totalStars}`, 12, 44);

  // V3: Shield indicator (left below stars)
  if (hasShield) {
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(`🛡️ ${labels.shield}`, 12, 62);
  }

  // V3: Question timer (if active)
  if (questionTimer !== undefined && questionTimer >= 0) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px Arial';
    const timerColor = questionTimer <= 2 ? '#ff3366' : '#ffffff';
    ctx.fillStyle = timerColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(`${Math.ceil(questionTimer)}`, width / 2, 100);
    ctx.fillText(`${Math.ceil(questionTimer)}`, width / 2, 100);
    ctx.restore();
  }
}

export const ShapeDashView: React.FC<ShapeDashViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const shapeDashText = t.games.shape_dash;
  const shapeDashLabels: ShapeDashLabels = {
    attempt: shapeDashText.attemptLabel,
    score: shapeDashText.scoreLabel,
    shield: shapeDashText.shieldLabel,
    oneMoreWrongWarning: shapeDashText.oneMoreWrongWarning,
    wrongGateNextWarning: shapeDashText.wrongGateNextWarning,
  };
  const [gameState, setGameState] = useState<'playing' | 'crashed' | 'won'>('playing');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayAttempt, setDisplayAttempt] = useState(1);
  const [displayStarsCollected, setDisplayStarsCollected] = useState(0);
  const [displayTotalStars, setDisplayTotalStars] = useState(0);
  const [displayRating, setDisplayRating] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(CANVAS_MAX_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(CANVAS_HEIGHT_BASE);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef(problem);
  const onAnswerRef = useRef(onAnswer);
  const soundEnabledRef = useRef(soundEnabled);
  const gameStateRef = useRef(gameState);
  const setGameStateRef = useRef(setGameState);
  const canvasSizeRef = useRef({ width: CANVAS_MAX_WIDTH, height: CANVAS_HEIGHT_BASE });
  const lastTimeRef = useRef(0);
  const jumpRequestedRef = useRef(false);
  const lastGroundedRef = useRef(false);

  // V2: Single game state ref object
  const stateRef = useRef<GameState>({
    scroll: 0,
    playerY: GROUND_Y - PLAYER_SIZE,
    playerVelY: 0,
    playerRotation: 0,
    isOnGround: true,
    canDoubleJump: true,
    gravityFlipped: false,
    speedMultiplier: 1,
    playerScale: 1,
    squashStretch: 1,
    screenShake: 0,
    attemptCount: 1,
    score: 0,
    coinsCollected: 0,
    pulsePhase: 0,
    particles: [],
    trailPoints: [],
    // V3 additions
    combo: 1,
    comboCount: 0,
    starsCollected: 0,
    correctAnswerStreak: 0,
    hasShield: false,
    questionTimer: -1,
    collectedStarIds: new Set(),
    bestScore: 0,
    totalStars: problem.stars?.length ?? 0,
    // V4 additions
    passedGateIds: new Set(),
    passedObstacleIndices: new Set(),
    consecutiveWrongGates: 0,
    revealedGateId: null,
    slowTimeUntil: 0,
    feedbackMessage: null,
    feedbackType: null,
    feedbackUntil: 0,
  });

  useEffect(() => {
    problemRef.current = problem;
    onAnswerRef.current = onAnswer;
    soundEnabledRef.current = soundEnabled;
    gameStateRef.current = gameState;
    setGameStateRef.current = setGameState;
  }, [problem, onAnswer, soundEnabled, gameState]);

  useEffect(() => {
    canvasSizeRef.current = { width: canvasWidth, height: canvasHeight };
  }, [canvasWidth, canvasHeight]);

  // Reset game state when problem changes
  useEffect(() => {
    const state = stateRef.current;
    state.passedGateIds.clear();
    state.collectedStarIds.clear();
    state.passedObstacleIndices.clear();
    state.totalStars = problem.stars?.length ?? 0;
    state.consecutiveWrongGates = 0;
    state.revealedGateId = null;
    state.slowTimeUntil = 0;
    state.feedbackMessage = null;
    state.feedbackType = null;
    state.feedbackUntil = 0;
  }, [problem]);

  const doRetry = useCallback(() => {
    const state = stateRef.current;
    const groundY = getGroundY(canvasHeight);
    state.scroll = 0;
    state.playerY = groundY - PLAYER_SIZE;
    state.playerVelY = 0;
    state.playerRotation = 0;
    state.isOnGround = true;
    state.canDoubleJump = true;
    state.squashStretch = 1;
    state.screenShake = 0;
    state.score = 0;
    state.particles = [];
    state.trailPoints = [];
    state.attemptCount += 1;
    // V3: Reset combo and stars but keep streak and shield
    state.combo = 1;
    state.comboCount = 0;
    state.starsCollected = 0;
    state.collectedStarIds = new Set();
    state.totalStars = problemRef.current.stars?.length ?? 0;
    // V4: Reset gate state
    state.passedGateIds = new Set();
    state.passedObstacleIndices = new Set();
    state.consecutiveWrongGates = 0;
    state.revealedGateId = null;
    state.slowTimeUntil = 0;
    state.feedbackMessage = null;
    state.feedbackType = null;
    state.feedbackUntil = 0;
    jumpRequestedRef.current = false;
    lastGroundedRef.current = false;
    setGameStateRef.current('playing');
    playSound('tap', soundEnabledRef.current);
  }, [canvasHeight]);

  // V4: Get paid hints from config (memoized to prevent dependency issues)
  const hints = useMemo(() => GAME_CONFIG.shape_dash?.paidHints ?? [], []);

  // V4: Paid hint handler
  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (!spendStars) return;

      const state = stateRef.current;
      const currentTime = performance.now();

      // Find the hint configuration
      const hint = hints.find((h) => h.id === hintId);
      if (!hint) return;

      // Spend stars before activating hint
      if (!spendStars(hint.cost)) return;

      if (hintId === 'reveal_gate') {
        // Find next unpassed gate
        const shapeGates = problemRef.current.shapeGates ?? [];
        const nextGate = shapeGates.find((g) => !state.passedGateIds.has(g.id));
        if (nextGate) {
          state.revealedGateId = nextGate.id;
          playSound('correct', soundEnabledRef.current);
          // Clear reveal after 5 seconds
          setTimeout(() => {
            if (stateRef.current.revealedGateId === nextGate.id) {
              stateRef.current.revealedGateId = null;
            }
          }, 5000);
        }
      } else if (hintId === 'slow_time') {
        // Slow time for 3 seconds
        state.slowTimeUntil = currentTime + 3000;
        playSound('tap', soundEnabledRef.current);
      }
    },
    [spendStars, hints],
  );

  const requestJump = useCallback(() => {
    jumpRequestedRef.current = true;
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      e.preventDefault();
      e.stopPropagation();
      if (gameStateRef.current === 'crashed') {
        doRetry();
        return;
      }
      requestJump();
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [requestJump, doRetry]);

  useEffect(() => {
    const state = stateRef.current;
    const groundY = getGroundY(canvasHeight);
    state.scroll = 0;
    state.playerY = groundY - PLAYER_SIZE;
    state.playerVelY = 0;
    state.playerRotation = 0;
    state.isOnGround = true;
    state.canDoubleJump = true;
    state.squashStretch = 1;
    state.screenShake = 0;
    state.score = 0;
    state.particles = [];
    state.trailPoints = [];
    state.attemptCount = 1;
    // V4: Reset gate state
    state.passedGateIds = new Set();
    state.passedObstacleIndices = new Set();
    state.consecutiveWrongGates = 0;
    state.revealedGateId = null;
    state.slowTimeUntil = 0;
    state.feedbackMessage = null;
    state.feedbackType = null;
    state.feedbackUntil = 0;
    jumpRequestedRef.current = false;
    lastGroundedRef.current = false;
    const id = setTimeout(() => {
      setGameState('playing');
    }, 0);
    return () => clearTimeout(id);
  }, [problem.uid, canvasHeight]);

  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  // Keep the runner wide on desktop, but give narrow screens enough height for
  // all three gate lanes above the ground.
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const width = Math.max(1, Math.min(Math.floor(rect.width), CANVAS_MAX_WIDTH));
      const height = getCanvasHeight(width, window.innerHeight);

      setCanvasWidth(width);
      setCanvasHeight(height);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;

    const loop = (time: number) => {
      rafId = requestAnimationFrame(loop);

      const prob = problemRef.current;
      const obstacles = prob.obstacles ?? [];
      // V4: Use shapeGates if available, fallback to checkpoints for backward compatibility
      const shapeGates = prob.shapeGates ?? [];

      if (gameStateRef.current !== 'playing') {
        return;
      }

      const dt = Math.min(0.032, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      const state = stateRef.current;
      const { width: activeCanvasWidth, height: activeCanvasHeight } = canvasSizeRef.current;

      // V4: Calculate dynamic ground and gate scale so narrow screens keep all lanes playable.
      const groundY = getGroundY(activeCanvasHeight);
      const gateScale = getResponsiveGateScale(groundY);
      const playerX = getPlayerX(activeCanvasWidth);

      // V4: Check for slow time effect
      const isSlowTime = time < state.slowTimeUntil;
      const timeScale = isSlowTime ? 0.7 : 1.0; // 30% slower during slow time

      // V3: Check boost zone for speed multiplier
      const collectibleStars = prob.stars ?? [];
      const jumpPads = prob.jumpPads ?? [];
      const boostZones = prob.boostZones ?? [];
      const inBoostZone = checkBoostZone(playerX, boostZones, state.scroll);
      const speedMultiplier = inBoostZone ? BOOST_ZONE_MULTIPLIER : 1;

      const nextScroll = state.scroll + prob.scrollSpeed * speedMultiplier * timeScale * dt;
      let py = state.playerY;
      let pvy = state.playerVelY;

      // V3: Check jump pad contact (auto-bounce when landing on pad)
      const jumpPadId = checkJumpPadContact(
        { x: playerX, y: py, velocityY: pvy, isOnGround: state.isOnGround },
        jumpPads,
        nextScroll,
      );
      if (jumpPadId && state.isOnGround) {
        pvy = JUMP_PAD_BOOST_VELOCITY;
        state.canDoubleJump = true;
        playSound('tap', soundEnabledRef.current);
      }

      // Jump handling
      if (jumpRequestedRef.current) {
        jumpRequestedRef.current = false;
        const onGround = py + PLAYER_SIZE >= groundY - 4;
        if (onGround) {
          pvy = JUMP_VELOCITY;
          state.canDoubleJump = true;
          state.squashStretch = JUMP_SQUASH;
          playSound('tap', soundEnabledRef.current);
        } else if (state.canDoubleJump) {
          pvy = JUMP_VELOCITY;
          state.canDoubleJump = false;
          playSound('tap', soundEnabledRef.current);
        }
      }

      // Physics
      pvy += GRAVITY * dt;
      py += pvy * dt;

      // Ground collision
      const wasGrounded = lastGroundedRef.current;
      if (py + PLAYER_SIZE >= groundY) {
        py = groundY - PLAYER_SIZE;
        pvy = 0;
        state.isOnGround = true;
        state.canDoubleJump = true;
        // Landing detection
        if (!wasGrounded) {
          state.squashStretch = LANDING_STRETCH;
          state.particles.push(...createLandParticles(playerX, groundY));
        }
        lastGroundedRef.current = true;
      } else {
        state.isOnGround = false;
        lastGroundedRef.current = false;
      }

      // Update rotation
      if (!state.isOnGround) {
        state.playerRotation += ROTATION_SPEED * dt;
      } else {
        // Snap to nearest 90° on ground
        const target = Math.round(state.playerRotation / (Math.PI / 2)) * (Math.PI / 2);
        state.playerRotation = target;
      }

      // Squash/stretch decay
      state.squashStretch = state.squashStretch + (1 - state.squashStretch) * SQUASH_STRETCH_DECAY;

      // Screen shake decay
      if (state.screenShake > 0) {
        state.screenShake = Math.max(0, state.screenShake - dt * SCREEN_SHAKE_DECAY);
      }

      // Update pulse phase
      state.pulsePhase += dt;

      const playerEngineState = {
        x: playerX,
        y: py + PLAYER_SIZE,
        velocityY: pvy,
        isOnGround: state.isOnGround,
      };

      // V3: Check star collection
      const newlyCollectedStarIds = checkStarCollection(
        playerEngineState,
        collectibleStars,
        nextScroll,
        groundY, // Pass groundY for correct coordinate calculation
      );
      for (const starId of newlyCollectedStarIds) {
        if (!state.collectedStarIds.has(starId)) {
          state.collectedStarIds.add(starId);
          state.starsCollected += 1;
          const starPoints = 100 * state.combo;
          state.score += starPoints;
          // Mark star as collected in the problem data
          const star = collectibleStars.find((s) => s.id === starId);
          if (star) {
            star.collected = true;
            // Create sparkle and score popup particles
            const starScreenX = star.x - nextScroll;
            const starScreenY = groundY - star.y;
            state.particles.push(...createSparkleParticles(starScreenX, starScreenY));
            state.particles.push(
              ...createScorePopup(starScreenX, starScreenY, starPoints, state.combo),
            );
            playSound('correct', soundEnabledRef.current);
          }
        }
      }

      // Update base score from distance
      const baseScore = Math.floor(nextScroll / 10);
      if (baseScore > state.score) {
        state.score = baseScore;
      }

      // Update trail
      state.trailPoints.push({ x: playerX, y: py });
      if (state.trailPoints.length > 12) state.trailPoints.shift();

      // Update particles
      state.particles = updateParticles(state.particles, dt);

      state.playerY = py;
      state.playerVelY = pvy;
      state.scroll = nextScroll;

      const playerLeft = playerX;
      const playerRight = playerX + PLAYER_SIZE;
      const playerTop = py;
      const playerBottom = py + PLAYER_SIZE;

      // Collision detection (with 6px inset margins for forgiveness)
      let collision = false;
      for (const obs of obstacles) {
        const obsScreenX = obs.x - nextScroll;
        const offsetY = obs.offsetY ?? 0;
        if (obs.type === 'circle') {
          const r = obs.radius ?? 18;
          const cx = obsScreenX + r;
          const cy = groundY - r - offsetY;
          if (obsScreenX + r * 2 < -20 || obsScreenX > activeCanvasWidth + 20) continue;
          const closestX = Math.max(playerLeft + 6, Math.min(cx, playerRight - 6));
          const closestY = Math.max(playerTop + 6, Math.min(cy, playerBottom - 6));
          const distSq = (closestX - cx) ** 2 + (closestY - cy) ** 2;
          if (distSq < (r + 4) ** 2) collision = true;
          if (collision) break;
        } else {
          const w = SPIKE_WIDTH;
          const h = obs.type === 'spike' ? SPIKE_HEIGHT : (obs.height ?? BLOCK_DEFAULT_HEIGHT);
          const obsLeft = obsScreenX;
          const obsRight = obsScreenX + w;
          const obsTop = groundY - h - offsetY;
          const obsBottom = groundY - offsetY;
          if (obsScreenX + w < -20 || obsScreenX > activeCanvasWidth + 20) continue;
          if (
            playerRight - 6 > obsLeft + 6 &&
            playerLeft + 6 < obsRight - 6 &&
            playerBottom - 6 > obsTop + 6 &&
            playerTop + 6 < obsBottom - 6
          ) {
            collision = true;
            break;
          }
        }
      }

      if (collision) {
        // V3: Shield absorbs one hit
        if (state.hasShield) {
          state.hasShield = false;
          state.particles.push(
            ...createExplosionParticles(playerX + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2, '#00ffcc'),
          );
          playSound('tap', soundEnabledRef.current);
          // Reset combo but don't crash
          state.combo = 1;
          state.comboCount = 0;
        } else {
          state.screenShake = SCREEN_SHAKE_INTENSITY;
          state.particles.push(
            ...createExplosionParticles(playerX + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2, '#00ff88'),
          );
          setDisplayScore(state.score);
          setDisplayAttempt(state.attemptCount);
          setGameState('crashed');
          playSound('wrong', soundEnabledRef.current);
          onAnswerRef.current(false);
          return;
        }
      }

      // V3: Build combo when passing obstacles (not every frame)
      // Check if player has passed any obstacles
      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (!obs) continue;
        const obsScreenX = obs.x - nextScroll;
        // If obstacle is behind player and not yet counted as passed
        if (obsScreenX + SPIKE_WIDTH < playerX && !state.passedObstacleIndices.has(i)) {
          state.passedObstacleIndices.add(i);
          state.comboCount += 1;
          if (state.comboCount >= 3 && state.combo < 3) {
            state.combo = Math.min(3, state.combo + 1);
            state.comboCount = 0;
          }
        }
      }

      // V4: Shape gate detection (replaces checkpoint modal system)
      const gatePass = checkShapeGatePass(
        playerEngineState,
        shapeGates,
        nextScroll,
        state.passedGateIds,
        groundY,
        gateScale,
      );

      if (gatePass) {
        const gate = shapeGates[gatePass.gateIndex];
        if (gate && !state.passedGateIds.has(gate.id)) {
          state.passedGateIds.add(gate.id);
          const chosenShape = gate.shapes[gatePass.gateChoice];
          const isCorrect = chosenShape?.isCorrect ?? false;

          if (isCorrect) {
            // Correct gate: +200 points, reset consecutive wrong counter, maintain combo
            state.score += 200 * state.combo;
            state.consecutiveWrongGates = 0;
            state.feedbackMessage = `✓ ${shapeDashText.gateCorrect}`;
            state.feedbackType = 'correct';
            state.feedbackUntil = time + 1000;
            playSound('correct', soundEnabledRef.current);
            // Create sparkle particles at player position
            state.particles.push(
              ...createSparkleParticles(playerX + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2),
            );
            state.particles.push(
              ...createScorePopup(playerX + PLAYER_SIZE / 2, py - 20, 200, state.combo),
            );
          } else {
            // Wrong gate
            state.consecutiveWrongGates += 1;

            if (state.consecutiveWrongGates >= 2) {
              // 2 consecutive wrong gates = crash
              state.screenShake = SCREEN_SHAKE_INTENSITY;
              state.particles.push(
                ...createExplosionParticles(
                  playerX + PLAYER_SIZE / 2,
                  py + PLAYER_SIZE / 2,
                  '#ff3366',
                ),
              );
              setDisplayScore(state.score);
              setDisplayAttempt(state.attemptCount);
              setGameState('crashed');
              playSound('wrong', soundEnabledRef.current);
              onAnswerRef.current(false);
              return;
            } else {
              // First wrong gate: lose shield OR lose combo
              if (state.hasShield) {
                state.hasShield = false;
                state.particles.push(
                  ...createExplosionParticles(
                    playerX + PLAYER_SIZE / 2,
                    py + PLAYER_SIZE / 2,
                    '#00ffcc',
                  ),
                );
                state.feedbackMessage = shapeDashText.shieldLost;
              } else {
                state.combo = 1;
                state.comboCount = 0;
                state.feedbackMessage = `✗ ${shapeDashText.gateWrong}`;
              }
              state.feedbackType = 'wrong';
              state.feedbackUntil = time + 1500;
              playSound('wrong', soundEnabledRef.current);
            }
          }
        }
      }

      // Win detection
      if (hasReachedFinish(nextScroll, prob.runLength)) {
        // Add initial victory fireworks immediately
        state.particles.push(
          ...createFireworkParticles(activeCanvasWidth * 0.5, activeCanvasHeight * 0.25),
        );
        setDisplayScore(state.score);
        setDisplayAttempt(state.attemptCount);
        setDisplayStarsCollected(state.starsCollected);
        setDisplayTotalStars(state.totalStars);

        // V3: Calculate three-star rating
        // ⭐ Complete the run
        // ⭐⭐ Complete with 50%+ stars collected
        // ⭐⭐⭐ Complete with all stars + no hits (attemptCount === 1)
        let rating = 1;
        if (state.totalStars === 0) {
          // No stars in level: rate based on attempts only
          rating = state.attemptCount === 1 ? 3 : 2;
        } else {
          const starPercentage = state.starsCollected / state.totalStars;
          if (starPercentage >= 0.5) rating = 2;
          if (state.starsCollected === state.totalStars && state.attemptCount === 1) rating = 3;
        }
        setDisplayRating(rating);

        setGameState('won');
        playSound('win', soundEnabledRef.current);
        setTimeout(() => onAnswerRef.current(true), 800);
        return;
      }

      // Rendering
      const cw = activeCanvasWidth;
      const ch = activeCanvasHeight;
      ctx.clearRect(0, 0, cw, ch);

      // Apply screen shake
      ctx.save();
      if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake * 2;
        const shakeY = (Math.random() - 0.5) * state.screenShake * 2;
        ctx.translate(shakeX, shakeY);
      }

      drawBackground(ctx, nextScroll, state.pulsePhase, cw, ch, groundY);

      // V3: Draw boost zones (under everything)
      for (const zone of boostZones) {
        const zoneScreenX = zone.x - nextScroll;
        if (zoneScreenX + zone.width < -20 || zoneScreenX > cw + 20) continue;
        drawBoostZone(ctx, zoneScreenX, groundY, zone.width, state.pulsePhase);
      }

      // V3: Draw jump pads
      for (const pad of jumpPads) {
        const padScreenX = pad.x - nextScroll;
        if (padScreenX + JUMP_PAD_WIDTH < -20 || padScreenX > cw + 20) continue;
        drawJumpPad(ctx, padScreenX, groundY, state.pulsePhase);
      }

      // V4: Draw shape gates (replaces checkpoint stars)
      for (const gate of shapeGates) {
        if (state.passedGateIds.has(gate.id)) continue;
        const gateScreenX = gate.x - nextScroll;
        const gateLayout = getGateLayout(groundY, gateScale);
        // Only draw if gate zone is visible
        if (
          gateScreenX + gateLayout.zoneWidth / 2 < -20 ||
          gateScreenX - gateLayout.zoneWidth / 2 > cw + 20
        )
          continue;
        const revealed = state.revealedGateId === gate.id;
        drawShapeGates(ctx, gate, nextScroll, groundY, gateScale, state.pulsePhase, revealed);
      }

      // V3: Draw collectible stars
      for (const star of collectibleStars) {
        const starScreenX = star.x - nextScroll;
        const starScreenY = groundY - star.y;
        if (starScreenX + 40 < -20 || starScreenX > cw + 20) continue;
        drawStar(ctx, starScreenX, starScreenY, state.pulsePhase, star.collected ?? false);
      }

      // Obstacles
      for (const obs of obstacles) {
        const obsScreenX = obs.x - nextScroll;
        if (obsScreenX + 50 < -20 || obsScreenX > cw + 20) continue;
        const offsetY = obs.offsetY ?? 0;
        const height = obs.type === 'spike' ? SPIKE_HEIGHT : (obs.height ?? BLOCK_DEFAULT_HEIGHT);
        const radius = obs.radius ?? 18;
        drawObstacle(ctx, obs.type, obsScreenX, groundY, offsetY, height, radius, state.pulsePhase);
      }

      // Trail
      drawTrail(ctx, state.trailPoints, PLAYER_SIZE);

      // Player
      drawPlayer(
        ctx,
        playerX,
        py,
        PLAYER_SIZE,
        state.playerRotation,
        state.squashStretch,
        state.playerScale,
        state.pulsePhase,
        state.hasShield,
      );

      // Particles
      drawParticles(ctx, state.particles);

      // HUD
      const progress = Math.min(1, nextScroll / prob.runLength);
      drawHUD(
        ctx,
        progress,
        state.attemptCount,
        state.score,
        cw,
        state.combo,
        state.starsCollected,
        state.totalStars,
        state.hasShield,
        shapeDashLabels,
      );

      // V4: Draw gate warning if approaching
      const approachingGateIndex = getApproachingGateIndex(
        playerX,
        shapeGates,
        nextScroll,
        state.passedGateIds,
        400,
      );
      if (approachingGateIndex !== null) {
        const gate = shapeGates[approachingGateIndex];
        if (gate) {
          drawGateWarning(
            ctx,
            gate.prompt,
            cw,
            state.pulsePhase,
            state.consecutiveWrongGates,
            shapeDashLabels,
          );
        }
      }

      // V4: Draw feedback message
      if (state.feedbackMessage && time < state.feedbackUntil && state.feedbackType) {
        drawFeedback(ctx, state.feedbackMessage, state.feedbackType, cw, state.pulsePhase);
      }

      ctx.restore();
    };

    lastTimeRef.current = performance.now();
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - we want the loop to use current canvas dimensions without restarting

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (gameState === 'crashed') {
        doRetry();
        return;
      }
      requestJump();
    },
    [gameState, requestJump, doRetry],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (gameState === 'crashed') {
        doRetry();
        return;
      }
      requestJump();
    },
    [gameState, requestJump, doRetry],
  );

  const handleJumpButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (gameState === 'crashed') {
        doRetry();
        return;
      }
      requestJump();
    },
    [gameState, requestJump, doRetry],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'crashed') {
          doRetry();
          return;
        }
        requestJump();
      }
    },
    [gameState, requestJump, doRetry],
  );

  const tapToRetry =
    shapeDashText.tapToRetry ?? (t.game as { retry?: string })?.retry ?? 'Tap to try again';
  const playAreaLabel = shapeDashText.playAreaLabel ?? shapeDashText.title ?? 'Shape Dash';

  return (
    <div className="shape-dash-shell flex flex-col items-center gap-2 w-full max-w-4xl relative sm:gap-3">
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl bg-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 w-full"
        style={{
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          maxWidth: '100%',
          boxShadow: '0 0 40px rgba(0, 255, 136, 0.2)',
        }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={gameState === 'crashed' ? tapToRetry : playAreaLabel}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="block w-full h-full"
          style={{ display: 'block' }}
        />
        {gameState === 'won' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none rounded-2xl"
            style={{
              background:
                'radial-gradient(circle, rgba(0, 255, 136, 0.4) 0%, rgba(0, 255, 204, 0.2) 100%)',
            }}
          >
            <span className="text-5xl">🎉</span>
            <span className="text-3xl font-black text-white drop-shadow-lg">
              {shapeDashText.completeLabel}
            </span>
            <div className="text-4xl">{'⭐'.repeat(displayRating)}</div>
            <span className="text-xl font-bold text-white drop-shadow-md">
              {shapeDashText.scoreLabel}: {displayScore}
            </span>
            <span className="text-lg font-semibold text-white/90 drop-shadow-md">
              {shapeDashText.starsLabel}: {displayStarsCollected}/{displayTotalStars}
            </span>
          </div>
        )}
        {gameState === 'crashed' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 51, 102, 0.5) 0%, rgba(255, 0, 0, 0.3) 100%)',
            }}
          >
            <span className="text-5xl">💥</span>
            <span className="text-xl font-bold text-white drop-shadow-md text-center px-4">
              {tapToRetry}
            </span>
            <span className="text-lg font-semibold text-white/90 drop-shadow-md">
              {shapeDashText.attemptLabel} {displayAttempt}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        data-testid="shape-dash-jump-button"
        className="shape-dash-jump-button flex min-h-[48px] w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-400 px-5 py-2.5 text-base font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:min-h-[52px] sm:py-3"
        onClick={handleJumpButtonClick}
        aria-label={gameState === 'crashed' ? tapToRetry : shapeDashText.jumpLabel}
      >
        <ArrowUp size={22} strokeWidth={3} aria-hidden="true" />
        <span>{gameState === 'crashed' ? tapToRetry : shapeDashText.jumpLabel}</span>
      </button>

      {/* Instructions hint */}
      <div className="hidden text-sm text-slate-400 text-center sm:block">
        <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-semibold text-slate-200">
          SPACE
        </kbd>{' '}
        {shapeDashText.jumpHint}
      </div>

      {/* V4: Paid hint buttons */}
      <PaidHintButtons
        hints={hints}
        stars={stars}
        onHintClick={handlePaidHint}
        disabled={gameState !== 'playing'}
        placement="inline"
      />
    </div>
  );
};
