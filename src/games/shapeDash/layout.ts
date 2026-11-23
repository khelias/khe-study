import { GATE_STACK_GROUND_CLEARANCE, GATE_ZONE_HEIGHT } from '../../engine/shapeDash';

// Responsive canvas with a taller mobile playfield so vertical gate lanes remain playable.
const CANVAS_DESKTOP_ASPECT_RATIO = 16 / 10;
const CANVAS_MOBILE_ASPECT_RATIO = 1.1;
export const CANVAS_MAX_WIDTH = 896;
export const CANVAS_HEIGHT_BASE = 400;
const CANVAS_MIN_HEIGHT = 236;

const GROUND_DEPTH_MIN = 46;
const GROUND_DEPTH_MAX = 72;
const GATE_TARGET_TOP_MARGIN = 28;
const GATE_MIN_SCALE = 0.78;

const PLAYER_X = 140;
const PLAYER_MIN_X = 76;
const PLAYER_SMALL_SCREEN_RATIO = 0.24;
export const PLAYER_SIZE = 42;

export const ROTATION_SPEED = 8;
export const SQUASH_STRETCH_DECAY = 0.15;
export const JUMP_SQUASH = 0.7;
export const LANDING_STRETCH = 1.3;
export const SCREEN_SHAKE_INTENSITY = 8;
export const SCREEN_SHAKE_DECAY = 10;

export interface ShapeDashLabels {
  attempt: string;
  score: string;
  shield: string;
  oneMoreWrongWarning: string;
  wrongGateNextWarning: string;
}

export interface ShapeDashFeedbackCopy {
  gateCorrect: string;
  gateWrong: string;
  shieldLost: string;
}

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

export function getCanvasHeight(width: number, viewportHeight: number): number {
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

export function getGroundY(canvasHeight: number): number {
  return canvasHeight - getGroundDepth(canvasHeight);
}

export function getResponsiveGateScale(groundY: number): number {
  const availableHeight = groundY - GATE_TARGET_TOP_MARGIN - GATE_STACK_GROUND_CLEARANCE;
  return clamp(availableHeight / GATE_ZONE_HEIGHT, GATE_MIN_SCALE, 1);
}

export function getPlayerX(canvasWidth: number): number {
  return Math.min(
    PLAYER_X,
    Math.max(PLAYER_MIN_X, Math.floor(canvasWidth * PLAYER_SMALL_SCREEN_RATIO)),
  );
}

export const GROUND_Y = getGroundY(CANVAS_HEIGHT_BASE);
