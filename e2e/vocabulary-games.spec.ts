import { expect, test, type Page } from './fixtures';
import { GAME_CONFIG } from '../src/games/data';
import {
  LANGUAGE_VOCABULARY_EN_PACK,
  LANGUAGE_VOCABULARY_ET_PACK,
} from '../src/curriculum/packs/language/vocabulary';
import { gameIdToSlug } from '../src/utils/gameSlug';

const GAME_STORE_KEY = 'smart_adv_v45_pro';
const ANALYTICS_CONSENT_KEY = 'khe.analyticsConsent.v1';
const LOCALE_STORAGE_KEY = 'app_locale';
const GAME_IDS = Object.keys(GAME_CONFIG);

type Locale = 'et' | 'en';
type SeedProfile = 'starter' | 'advanced';

const PACK_WORDS_BY_LOCALE: Record<Locale, Set<string>> = {
  et: new Set(LANGUAGE_VOCABULARY_ET_PACK.items.map((item) => item.w)),
  en: new Set(LANGUAGE_VOCABULARY_EN_PACK.items.map((item) => item.w)),
};

function seededStoreState(profile: SeedProfile = 'starter') {
  return {
    state: {
      profile,
      hasSeenTutorial: true,
      hearts: 5,
      stars: 150,
      stats: {
        gamesPlayed: GAME_IDS.length,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalScore: 0,
        maxStreak: 0,
        currentStreak: 0,
        maxLevels: {},
        gamesByType: Object.fromEntries(GAME_IDS.map((id) => [id, 1])),
        totalTimePlayed: 0,
        lastPlayed: null,
        collectedStars: 0,
        maxSnakeLength: 0,
      },
    },
    version: 0,
  };
}

function attachRuntimeFailureCapture(page: Page): {
  consoleErrors: string[];
  pageErrors: string[];
} {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  return { consoleErrors, pageErrors };
}

async function openVocabularyGame(
  page: Page,
  gameId: 'word_builder' | 'word_cascade' | 'picture_pairs' | 'letter_match',
  locale: Locale,
  options: { profile?: SeedProfile; seed?: number } = {},
): Promise<void> {
  const profile = options.profile ?? 'starter';
  const seed = options.seed ?? 1;

  await page.addInitScript(
    ({
      analyticsConsentKey,
      locale,
      localeStorageKey,
      seededStore,
      storeKey,
    }: {
      analyticsConsentKey: string;
      locale: Locale;
      localeStorageKey: string;
      seededStore: ReturnType<typeof seededStoreState>;
      storeKey: string;
    }) => {
      window.localStorage.setItem(storeKey, JSON.stringify(seededStore));
      window.localStorage.setItem(localeStorageKey, locale);
      window.localStorage.setItem(
        analyticsConsentKey,
        JSON.stringify({ value: 'denied', updatedAt: '2026-04-28T00:00:00.000Z' }),
      );
    },
    {
      analyticsConsentKey: ANALYTICS_CONSENT_KEY,
      locale,
      localeStorageKey: LOCALE_STORAGE_KEY,
      seededStore: seededStoreState(profile),
      storeKey: GAME_STORE_KEY,
    },
  );

  await page.goto(`/study/games/${gameIdToSlug(gameId)}?lang=${locale}&seed=${seed}`);
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await waitForGameReady(page);
}

async function waitForGameReady(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: /muuda taset|change level/i })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('.animate-spin')).toHaveCount(0);
}

async function hasRecordedAnswer(page: Page): Promise<boolean> {
  return page.evaluate((storeKey) => {
    const raw = window.localStorage.getItem(storeKey);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw) as {
        state?: { stats?: { correctAnswers?: number; wrongAnswers?: number } };
      };
      const stats = parsed.state?.stats;
      return (stats?.correctAnswers ?? 0) + (stats?.wrongAnswers ?? 0) > 0;
    } catch {
      return false;
    }
  }, GAME_STORE_KEY);
}

async function waitForRecordedAnswer(page: Page): Promise<void> {
  await page.waitForFunction(
    (storeKey) => {
      const raw = window.localStorage.getItem(storeKey);
      if (!raw) return false;
      try {
        const parsed = JSON.parse(raw) as {
          state?: { stats?: { correctAnswers?: number; wrongAnswers?: number } };
        };
        const stats = parsed.state?.stats;
        return (stats?.correctAnswers ?? 0) + (stats?.wrongAnswers ?? 0) > 0;
      } catch {
        return false;
      }
    },
    GAME_STORE_KEY,
    { timeout: 10_000 },
  );
}

async function revealWordBuilderAnswer(page: Page): Promise<void> {
  for (let i = 0; i < 8; i++) {
    if (await hasRecordedAnswer(page)) return;
    await page.getByTestId('paid-hint-reveal_next').click();
    await page.waitForTimeout(80);
  }
  await waitForRecordedAnswer(page);
}

async function completeWordCascadeWithHints(page: Page): Promise<void> {
  for (let i = 0; i < 8; i++) {
    if (await hasRecordedAnswer(page)) return;
    await page.getByTestId('paid-hint-reveal_next').click();
    await page
      .getByRole('button', { name: /tap this one|puuduta seda/i })
      .first()
      .dispatchEvent('click');
    await page.waitForTimeout(120);
  }
  await waitForRecordedAnswer(page);
}

test.describe('smart games — vocabulary UI smoke', () => {
  for (const locale of ['et', 'en'] as const) {
    test(`word_builder renders ${locale} vocabulary and records an answer`, async ({ page }) => {
      const failures = attachRuntimeFailureCapture(page);

      await openVocabularyGame(page, 'word_builder', locale, { seed: 11 });
      await expect(page.getByTestId('word-builder-emoji')).toBeVisible();

      await revealWordBuilderAnswer(page);
      await waitForRecordedAnswer(page);

      expect(failures.consoleErrors).toEqual([]);
      expect(failures.pageErrors).toEqual([]);
    });

    test(`word_cascade renders ${locale} vocabulary and records an answer`, async ({ page }) => {
      const failures = attachRuntimeFailureCapture(page);

      await openVocabularyGame(page, 'word_cascade', locale, { seed: 12 });
      await expect(page.getByTestId('word-cascade-emoji')).toBeVisible();

      await completeWordCascadeWithHints(page);
      await waitForRecordedAnswer(page);

      expect(failures.consoleErrors).toEqual([]);
      expect(failures.pageErrors).toEqual([]);
    });

    test(`picture_pairs reveals ${locale} word-emoji content`, async ({ page }) => {
      const failures = attachRuntimeFailureCapture(page);

      await openVocabularyGame(page, 'picture_pairs', locale, {
        profile: 'advanced',
        seed: 13,
      });
      await expect(page.getByTestId('picture-pairs-card-0')).toBeVisible();
      await expect(page.getByTestId('paid-hint-reveal_pair')).toBeEnabled({ timeout: 3_000 });
      await page.getByTestId('paid-hint-reveal_pair').click();

      await expect
        .poll(async () => {
          const texts = await page.locator('[data-testid^="picture-pairs-card-"]').allInnerTexts();
          return texts.some((text) => PACK_WORDS_BY_LOCALE[locale].has(text.trim()));
        })
        .toBe(true);

      expect(failures.consoleErrors).toEqual([]);
      expect(failures.pageErrors).toEqual([]);
    });

    test(`letter_match renders ${locale} chrome and records an answer`, async ({ page }) => {
      const failures = attachRuntimeFailureCapture(page);

      await openVocabularyGame(page, 'letter_match', locale, { seed: 14 });
      await page.getByTestId('standard-answer-0').click();
      await waitForRecordedAnswer(page);

      expect(failures.consoleErrors).toEqual([]);
      expect(failures.pageErrors).toEqual([]);
    });
  }
});
