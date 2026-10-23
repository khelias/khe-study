import { describe, expect, it, vi } from 'vitest';
import * as pack from '../../../curriculum/packs/math/battlelearn';
import { generateBattleLearnQuestionForStage } from '../questions';
import { createRng } from '../../../engine/rng';

vi.mock('../../../curriculum/packs/math/battlelearn', async (importOriginal) => {
  const actual = await importOriginal<typeof pack>();
  return { ...actual, getBattleLearnQuestionStage: vi.fn(actual.getBattleLearnQuestionStage) };
});

describe('BattleLearn questions on the level ladder', () => {
  const items = pack.MATH_BATTLELEARN_PACK.items;

  it.each([
    [1, 'starter', 1],
    [5, 'starter', 5],
    [6, 'advanced', 1],
    [20, 'advanced', 15],
  ] as const)('level %i asks from the %s track at stage level %i', (level, track, stageLevel) => {
    for (const flow of ['initial', 'followup'] as const) {
      vi.mocked(pack.getBattleLearnQuestionStage).mockClear();
      generateBattleLearnQuestionForStage(items, flow, level, createRng(level), 6);
      expect(pack.getBattleLearnQuestionStage).toHaveBeenCalledWith(items, flow, track, stageLevel);
    }
  });
});
