import {
  BLOCK_DEFAULT_HEIGHT,
  JUMP_PAD_WIDTH,
  SPIKE_HEIGHT,
  SPIKE_WIDTH,
  getApproachingGateIndex,
  getGateLayout,
} from '../../engine/shapeDash';
import type { ShapeDashProblem } from '../../types/game';
import { PLAYER_SIZE, type ShapeDashLabels } from './layout';
import type { GameState, Particle } from './runState';

export interface RenderFrameParams {
  state: GameState;
  problem: ShapeDashProblem;
  width: number;
  height: number;
  groundY: number;
  gateScale: number;
  playerX: number;
  time: number;
  labels: ShapeDashLabels;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  scroll: number,
  pulsePhase: number,
  width: number,
  height: number,
  groundY: number,
) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#0a0a1a');
  skyGrad.addColorStop(0.5, '#1a1a3a');
  skyGrad.addColorStop(1, '#2a2a4a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, groundY);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const starOffset = (scroll * 0.05) % 100;
  for (let i = 0; i < 30; i++) {
    const x = ((i * 73) % width) - starOffset;
    const y = (i * 41) % groundY;
    ctx.fillRect(x, y, 2, 2);
  }

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
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(13, 15);
      ctx.lineTo(-13, 15);
      ctx.closePath();
      ctx.stroke();
    } else if (i % 3 === 1) {
      ctx.strokeRect(-12, -12, 24, 24);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(0, groundY, width, height - groundY);
  const stripeOffset = (scroll * 0.5) % 40;
  ctx.fillStyle = 'rgba(0, 255, 136, 0.08)';
  for (let sx = -stripeOffset; sx < width + 40; sx += 40) {
    ctx.fillRect(sx, groundY, 20, height - groundY);
  }

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
  pulsePhase: number,
  hasShield: boolean = false,
) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate(rotation);
  ctx.scale(1, squashStretch);

  if (hasShield) {
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 24 + Math.sin(pulsePhase * 6) * 8;
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 4;
    ctx.strokeRect(-size / 2 - 8, -size / 2 - 8, size + 16, size + 16);
  }

  const glowIntensity = 12 + Math.sin(pulsePhase * 4) * 4;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = glowIntensity;

  ctx.fillStyle = '#00ff88';
  ctx.fillRect(-size / 2, -size / 2, size, size);

  ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
  ctx.fillRect(-size / 2 + 6, -size / 2 + 6, size - 12, size - 12);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0a0a1a';
  const eyeY = -size / 4;
  const eyeSize = 6;
  ctx.fillRect(-size / 3, eyeY, eyeSize, eyeSize);
  ctx.fillRect(size / 3 - eyeSize, eyeY, eyeSize, eyeSize);

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

function drawStar(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  pulsePhase: number,
  collected: boolean,
) {
  if (collected) return;

  const STAR_SIZE = 16;
  const STAR_POINTS = 10;
  const STAR_ROTATION_OFFSET = -Math.PI / 2;
  const STAR_INNER_RADIUS_RATIO = 0.4;

  const pulse = 1 + Math.sin(pulsePhase * 5) * 0.15;
  const rotation = pulsePhase * 2;

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(rotation);
  ctx.scale(pulse, pulse);

  ctx.shadowColor = '#fef08a';
  ctx.shadowBlur = 16;

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  for (let i = 0; i < STAR_POINTS; i++) {
    const angle = (i * Math.PI) / 5 + STAR_ROTATION_OFFSET;
    const r = i % 2 === 0 ? STAR_SIZE : STAR_SIZE * STAR_INNER_RADIUS_RATIO;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-3, -3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawJumpPad(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  groundY: number,
  pulsePhase: number,
) {
  const width = JUMP_PAD_WIDTH;
  const height = 12;
  const pulse = 1 + Math.sin(pulsePhase * 4) * 0.08;

  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 20;

  ctx.fillStyle = '#00ffcc';
  ctx.fillRect(screenX, groundY - height * pulse, width, height * pulse);

  ctx.shadowBlur = 0;

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

function drawBoostZone(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  groundY: number,
  width: number,
  pulsePhase: number,
) {
  const height = 4;

  const gradient = ctx.createLinearGradient(screenX, 0, screenX + width, 0);
  gradient.addColorStop(0, 'rgba(255, 102, 0, 0)');
  gradient.addColorStop(0.5, 'rgba(255, 102, 0, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 102, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(screenX, groundY, width, height);

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

function drawShapeGates(
  ctx: CanvasRenderingContext2D,
  gate: NonNullable<ShapeDashProblem['shapeGates']>[number],
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

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(10, 12 * gateScale)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(shape.label, gateCenterX, gateY + gateLayout.height - 8 * gateScale);
  }
}

function drawGateWarning(
  ctx: CanvasRenderingContext2D,
  prompt: string,
  width: number,
  pulsePhase: number,
  consecutiveWrong: number,
  labels: Pick<ShapeDashLabels, 'oneMoreWrongWarning' | 'wrongGateNextWarning'>,
) {
  const pulse = 1 + Math.sin(pulsePhase * 4) * 0.1;

  const bgAlpha = consecutiveWrong >= 1 ? 0.3 : 0.2;
  const bgColor =
    consecutiveWrong >= 1 ? `rgba(255, 51, 102, ${bgAlpha})` : `rgba(0, 255, 204, ${bgAlpha})`;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 60, width, 60);

  ctx.strokeStyle = consecutiveWrong >= 1 ? '#ff3366' : '#00ffcc';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 60, width, 60);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `bold ${18 * pulse}px Arial`;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(prompt, width / 2, 95);
  ctx.fillText(prompt, width / 2, 95);
  ctx.restore();

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
) {
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

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(progress * 100)}%`, width / 2, barY + barHeight + 16);

  ctx.textAlign = 'left';
  ctx.fillText(`${labels.attempt} ${attemptCount}`, 12, 26);

  ctx.textAlign = 'right';
  ctx.fillText(`${labels.score}: ${score}`, width - 12, 26);

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

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fef08a';
  ctx.fillText(`⭐ ${starsCollected}/${totalStars}`, 12, 44);

  if (hasShield) {
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(`🛡️ ${labels.shield}`, 12, 62);
  }
}

export function renderShapeDashFrame(
  ctx: CanvasRenderingContext2D,
  { state, problem, width, height, groundY, gateScale, playerX, time, labels }: RenderFrameParams,
): void {
  const scroll = state.scroll;
  const obstacles = problem.obstacles ?? [];
  const shapeGates = problem.shapeGates ?? [];
  const collectibleStars = problem.stars ?? [];
  const jumpPads = problem.jumpPads ?? [];
  const boostZones = problem.boostZones ?? [];

  ctx.clearRect(0, 0, width, height);
  ctx.save();

  if (state.screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShake * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShake * 2;
    ctx.translate(shakeX, shakeY);
  }

  drawBackground(ctx, scroll, state.pulsePhase, width, height, groundY);

  for (const zone of boostZones) {
    const zoneScreenX = zone.x - scroll;
    if (zoneScreenX + zone.width < -20 || zoneScreenX > width + 20) continue;
    drawBoostZone(ctx, zoneScreenX, groundY, zone.width, state.pulsePhase);
  }

  for (const pad of jumpPads) {
    const padScreenX = pad.x - scroll;
    if (padScreenX + JUMP_PAD_WIDTH < -20 || padScreenX > width + 20) continue;
    drawJumpPad(ctx, padScreenX, groundY, state.pulsePhase);
  }

  for (const gate of shapeGates) {
    if (state.passedGateIds.has(gate.id)) continue;
    const gateScreenX = gate.x - scroll;
    const gateLayout = getGateLayout(groundY, gateScale);
    if (
      gateScreenX + gateLayout.zoneWidth / 2 < -20 ||
      gateScreenX - gateLayout.zoneWidth / 2 > width + 20
    ) {
      continue;
    }
    const revealed = state.revealedGateId === gate.id;
    drawShapeGates(ctx, gate, scroll, groundY, gateScale, state.pulsePhase, revealed);
  }

  for (const star of collectibleStars) {
    const starScreenX = star.x - scroll;
    const starScreenY = groundY - star.y;
    if (starScreenX + 40 < -20 || starScreenX > width + 20) continue;
    drawStar(ctx, starScreenX, starScreenY, state.pulsePhase, star.collected ?? false);
  }

  for (const obs of obstacles) {
    const obsScreenX = obs.x - scroll;
    if (obsScreenX + 50 < -20 || obsScreenX > width + 20) continue;
    const offsetY = obs.offsetY ?? 0;
    const obsHeight = obs.type === 'spike' ? SPIKE_HEIGHT : (obs.height ?? BLOCK_DEFAULT_HEIGHT);
    const radius = obs.radius ?? 18;
    drawObstacle(ctx, obs.type, obsScreenX, groundY, offsetY, obsHeight, radius, state.pulsePhase);
  }

  drawTrail(ctx, state.trailPoints, PLAYER_SIZE);

  drawPlayer(
    ctx,
    playerX,
    state.playerY,
    PLAYER_SIZE,
    state.playerRotation,
    state.squashStretch,
    state.pulsePhase,
    state.hasShield,
  );

  drawParticles(ctx, state.particles);

  const progress = Math.min(1, scroll / problem.runLength);
  drawHUD(
    ctx,
    progress,
    state.attemptCount,
    state.score,
    width,
    state.combo,
    state.starsCollected,
    state.totalStars,
    state.hasShield,
    labels,
  );

  const approachingGateIndex = getApproachingGateIndex(
    playerX,
    shapeGates,
    scroll,
    state.passedGateIds,
    400,
  );
  if (approachingGateIndex !== null) {
    const gate = shapeGates[approachingGateIndex];
    if (gate) {
      drawGateWarning(
        ctx,
        gate.prompt,
        width,
        state.pulsePhase,
        state.consecutiveWrongGates,
        labels,
      );
    }
  }

  if (state.feedbackMessage && time < state.feedbackUntil && state.feedbackType) {
    drawFeedback(ctx, state.feedbackMessage, state.feedbackType, width, state.pulsePhase);
  }

  ctx.restore();
}
