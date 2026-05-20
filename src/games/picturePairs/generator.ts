import { getPackItemsForLocale } from '../../curriculum';
import { LANGUAGE_VOCABULARY_SKILL } from '../../curriculum/skills/language';
import { type VocabularyWord } from '../../curriculum/packs/language/types';
import { getVocabularyWordsAvailableForLevel } from '../../curriculum/packs/language/vocabulary';
import { uid } from '../../engine/rng';
import { getLocale } from '../../i18n/index';
import type {
  GeneratorContext,
  PicturePairsCard,
  PicturePairsProblem,
  RngFunction,
} from '../../types/game';

export function generatePicturePairs(
  level: number,
  rng: RngFunction = Math.random,
  context: GeneratorContext = {},
): PicturePairsProblem {
  const locale = getLocale();
  const words = getPackItemsForLocale<VocabularyWord>(LANGUAGE_VOCABULARY_SKILL.id, locale);
  const allWords = getVocabularyWordsAvailableForLevel(words, level);
  if (allWords.length < 4) throw new Error('Not enough words for picture_pairs');

  // Pair count: scales with level; cap at 12 pairs (4×6) so grid fits on small screens
  const basePairs = 4;
  const pairGrowth = Math.floor(level / 2);
  const pairCount = Math.min(basePairs + pairGrowth, 12);
  const needPairs = Math.min(pairCount, Math.floor(allWords.length / 2));

  const pairs: Array<{ word: string; emoji: string }> = [];
  const used = new Set<string>();
  while (pairs.length < needPairs) {
    const idx = Math.floor(rng() * allWords.length);
    const item = allWords[idx];
    if (!item || used.has(item.w)) continue;
    used.add(item.w);
    pairs.push({ word: item.w, emoji: item.e });
  }

  const cards: PicturePairsCard[] = [];
  // Phase 5d: variant selection.
  // 1. Explicit `mechanicPreference.picture_pairs.variant` wins.
  // 2. Else default by ageHint (<5 → emoji_only, ≥5 → emoji_word).
  // 3. Cold-start (no ageHint) → emoji_word (Phase 5d new default).
  const variant =
    context.variant ??
    (context.ageHint != null && context.ageHint < 5 ? 'emoji_only' : 'emoji_word');
  const emojiOnly = variant === 'emoji_only';
  pairs.forEach((p, i) => {
    const matchId = `pair-${i}`;
    if (emojiOnly) {
      cards.push({ id: `emoji-a-${i}`, content: p.emoji, matchId, cardType: 'emoji' });
      cards.push({ id: `emoji-b-${i}`, content: p.emoji, matchId, cardType: 'emoji' });
    } else {
      cards.push({ id: `word-${i}`, content: p.word, matchId, cardType: 'word' });
      cards.push({ id: `emoji-${i}`, content: p.emoji, matchId, cardType: 'emoji' });
    }
  });

  return {
    type: 'picture_pairs',
    cards: cards.sort(() => rng() - 0.5),
    pairs,
    uid: uid(rng),
  };
}
