import { getPackItems } from '../../curriculum';
import {
  MATH_UNIT_CONVERSIONS_PACK,
  getUnitConversionItems,
  getUnitConversionStage,
  type UnitConversionDefinitionItem,
  type UnitConversionItem,
} from '../../curriculum/packs/math/unit_conversions';
import { getRandom, uid } from '../../engine/rng';
import type { RngFunction, UnitConversionProblem } from '../../types/game';

export function generateUnitConversion(
  level: number,
  rng: RngFunction = Math.random,
): UnitConversionProblem {
  const progressionProfile = 'starter';
  const packItems = getPackItems<UnitConversionItem>(MATH_UNIT_CONVERSIONS_PACK.id);
  const stage = getUnitConversionStage(packItems, progressionProfile, level);
  const conversionsById = new Map(
    getUnitConversionItems(packItems).map((conversion) => [conversion.id, conversion]),
  );
  const stageConversions = stage.conversionIds
    .map((conversionId) => conversionsById.get(conversionId))
    .filter((conversion): conversion is UnitConversionDefinitionItem => Boolean(conversion));
  const selectedConversion = getRandom(stageConversions, rng);
  const value = Math.floor(rng() * (stage.maxValue - stage.minValue + 1)) + stage.minValue;

  if (!selectedConversion) {
    throw new Error('No conversion found for unit_conversion game');
  }

  const correctAnswer = value * selectedConversion.factor;

  // Generate wrong answers with pedagogically appropriate variations
  const wrongAnswers = [
    Math.floor(correctAnswer * 0.1), // ÷10 (common mistake)
    Math.floor(correctAnswer * 0.5), // half
    Math.floor(correctAnswer * 1.1), // +10%
    Math.floor(correctAnswer * 0.9), // -10%
    Math.floor(correctAnswer * 1.5), // +50%
    Math.floor(correctAnswer / selectedConversion.factor), // original value without conversion
  ].filter((a) => a !== correctAnswer && a > 0);

  // Only add ×10 if the result won't be too large (pedagogically confusing)
  if (correctAnswer < 10000) {
    wrongAnswers.push(Math.floor(correctAnswer * 10));
  }

  const distractorCount = stage.optionCount - 1;
  const uniqueWrong = [...new Set(wrongAnswers)].sort(() => rng() - 0.5).slice(0, distractorCount);

  // If we don't have enough unique wrong answers, generate more (with safety limit)
  let attempts = 0;
  while (uniqueWrong.length < distractorCount && attempts < 20) {
    attempts++;
    const offset = Math.floor(rng() * correctAnswer * 0.3) + 1;
    const wrong = rng() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
    if (wrong > 0 && wrong !== correctAnswer && !uniqueWrong.includes(wrong)) {
      uniqueWrong.push(wrong);
    }
  }

  const options = [correctAnswer, ...uniqueWrong.slice(0, distractorCount)].sort(() => rng() - 0.5);

  return {
    type: 'unit_conversion',
    value,
    fromUnit: selectedConversion.from,
    toUnit: selectedConversion.to,
    category: selectedConversion.category,
    answer: correctAnswer,
    options,
    uid: uid(rng),
  };
}
