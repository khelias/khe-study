import type { Problem } from '../../types/game';
import { shapeShiftPiecesCompatible } from '../../engine/shapeShiftGrid';
import type { ShapeShiftSnapPiece } from '../../engine/shapeShiftGrid';
import type { AnswerValidator } from '../registry';

/**
 * Validator for shape shift games.
 * Allows small position tolerance and checks rotation with symmetry for circle, square, etc.
 * Coordinate model: see src/engine/shapeShiftGrid.ts.
 */
export const validateShapeShift: AnswerValidator = (
  problem: Problem,
  userAnswer: unknown,
): boolean => {
  if (problem.type !== 'shape_shift') return false;

  type PlacedShapeShiftPiece = ShapeShiftSnapPiece & {
    currentPosition: { x: number; y: number } | null;
    currentRotation: number;
  };

  const placedPieces = userAnswer as PlacedShapeShiftPiece[];

  if (!Array.isArray(placedPieces)) return false;

  // Get required (non-decoy) pieces
  const requiredPieces = problem.puzzle.pieces.filter((p) => !p.isDecoy);

  // Count placed non-decoy pieces
  const placedNonDecoy = placedPieces.filter((p) => !p.isDecoy && p.currentPosition !== null);

  if (placedNonDecoy.length !== requiredPieces.length) return false;

  const usedPlacedIndexes = new Set<number>();

  return requiredPieces.every((required) => {
    const matchIndex = placedNonDecoy.findIndex((placed, index) => {
      if (usedPlacedIndexes.has(index) || !placed.currentPosition) return false;
      if (!shapeShiftPiecesCompatible(placed, required)) return false;

      // Check position: allow ±10 units on 100x100 grid for more leeway when placing
      const POSITION_TOLERANCE = 10;
      const positionOk =
        Math.abs(placed.currentPosition.x - required.correctPosition.x) <= POSITION_TOLERANCE &&
        Math.abs(placed.currentPosition.y - required.correctPosition.y) <= POSITION_TOLERANCE;

      // Check rotation (handle symmetric shapes)
      const placedRot = ((placed.currentRotation % 360) + 360) % 360;
      const correctRot = ((required.correctRotation % 360) + 360) % 360;
      const ROTATION_TOLERANCE = 15; // ±15 degrees

      // Helper to check if angles are close (modulo 360)
      const isAngleClose = (a: number, b: number, tolerance: number) => {
        const diff = Math.abs(a - b) % 360;
        return diff <= tolerance || diff >= 360 - tolerance;
      };

      let rotationOk = false;

      if (required.type === 'circle') {
        rotationOk = true; // Rotation irrelevant
      } else if (required.type === 'square' || required.type === 'diamond') {
        // 90° symmetry: (placed - correct) should be multiple of 90
        const diff = Math.abs(placedRot - correctRot) % 90;
        rotationOk = diff <= ROTATION_TOLERANCE || diff >= 90 - ROTATION_TOLERANCE;
      } else if (required.type === 'rectangle' || required.type === 'hexagon') {
        // 180° symmetry
        const diff = Math.abs(placedRot - correctRot) % 180;
        rotationOk = diff <= ROTATION_TOLERANCE || diff >= 180 - ROTATION_TOLERANCE;
      } else {
        // No symmetry (triangles)
        rotationOk = isAngleClose(placedRot, correctRot, ROTATION_TOLERANCE);
      }

      return positionOk && rotationOk;
    });

    if (matchIndex === -1) return false;
    usedPlacedIndexes.add(matchIndex);
    return true;
  });
};
