import { getTranslations } from '../i18n';

type EncouragementType = 'correct' | 'wrong' | 'levelUp';

/**
 * Get a random encouragement message for the given type.
 */
export const getRandomEncouragement = (type: EncouragementType, streak = 0): string => {
  const t = getTranslations();
  const encouragements = t.feedback;

  if (type === 'correct') {
    if (streak >= 7) return encouragements.streak[5] ?? '';
    if (streak >= 6) return encouragements.streak[4] ?? '';
    if (streak >= 5) return encouragements.streak[3] ?? '';
    if (streak >= 4) return encouragements.streak[2] ?? '';
    if (streak >= 3) return encouragements.streak[1] ?? '';
    if (streak >= 2) return encouragements.streak[0] ?? '';
    return encouragements.correct[Math.floor(Math.random() * encouragements.correct.length)] ?? '';
  }
  if (type === 'wrong') {
    return encouragements.wrong[Math.floor(Math.random() * encouragements.wrong.length)] ?? '';
  }
  if (type === 'levelUp') {
    return encouragements.levelUp[Math.floor(Math.random() * encouragements.levelUp.length)] ?? '';
  }
  return '';
};
