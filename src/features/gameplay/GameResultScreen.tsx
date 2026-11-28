/**
 * GameResultScreen Component
 *
 * The round's end, one screen for every game (ADR 0005 point 1): goal reached
 * or lives out, the stars earned, the rounds toward the next level, this
 * round's achievements, and the next round or the menu.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, Flame, HeartCrack, Star, Trophy } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { useGameAudio } from '../../hooks/useGameAudio';
import { playMoment } from '../../engine/audio';
import { isSnakeGameType } from '../../engine/mathSnake';
import { roundLevelLine } from '../../engine/progression';
import { isTimedRound, roundAccuracy } from '../../engine/round';
import { SnakeSessionSummary } from './SnakeSessionSummary';
import { AchievementSticker, Sticker } from '../../components/stickers/Sticker';
import { nextAfterRound } from '../../meta/path';
import { pathRoundUrl } from '../../utils/gameSlug';
import { stickerName, streakText } from '../menu/gameTitle';

/** The delay of `.level-up-moment` in index.css, so the tone and the pop land together. */
const LEVEL_UP_DELAY_S = 0.5;

export const GameResultScreen: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { formatText } = useProfileText();
  const score = usePlaySessionStore((state) => state.score);
  const gameType = usePlaySessionStore((state) => state.gameType);
  const round = usePlaySessionStore((state) => state.round);
  const result = usePlaySessionStore((state) => state.roundResult);
  const bestStreak = usePlaySessionStore((state) => state.bestStreak);
  const startNextRound = usePlaySessionStore((state) => state.startNextRound);
  const snakeSessionStats = usePlaySessionStore((state) => state.snakeSessionStats);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const getHighScore = useGameStore((state) => state.getHighScore);
  const recordGameStart = useGameStore((state) => state.recordGameStart);
  const todayPath = useGameStore((state) => state.activeLearnerProfile.meta.path);
  const pathSlot = usePlaySessionStore((state) => state.pathSlot);
  const { playClick } = useGameAudio(soundEnabled);

  // The screen rises with its tone; a new level follows once it has settled (board 3A frame 7).
  // Keyed on the result alone: turning the sound on here must not replay it.
  useEffect(() => {
    if (!result) return;
    const { soundEnabled: sound } = useGameStore.getState();
    playMoment('roundEnd', sound);
    if (result.leveledUp) playMoment('levelUp', sound, LEVEL_UP_DELAY_S);
  }, [result]);

  if (!result || !gameType || !round) return null;

  const reached = round.status === 'reached';
  const isTimed = isTimedRound(round.spec);
  const highScore = getHighScore(gameType);
  const isNewRecord = score > 0 && score >= highScore;
  const gameTitle = t.games[gameType as keyof typeof t.games]?.title;

  const title = reached ? t.roundEnd.reachedTitle : isTimed ? t.game.timeUp : t.roundEnd.lostTitle;
  const line = roundLevelLine(result.level, result);
  const levelLine =
    line.kind === 'leveledUp'
      ? t.roundEnd.levelUp.replace('{level}', String(line.level))
      : line.kind === 'passed'
        ? t.roundEnd.levelPassed
        : (line.roundsLeft === 1 ? t.roundEnd.roundsToLevel_one : t.roundEnd.roundsToLevel_other)
            .replace('{count}', String(line.roundsLeft))
            .replace('{level}', String(line.nextLevel));

  const dayDone = result.path !== null && result.path.dayStreak !== null;
  const after = nextAfterRound({
    path: todayPath,
    pathSlot,
    reached,
    filled: result.path !== null,
    dayDone,
  });
  const nextLabel =
    after.kind === 'album'
      ? t.path.showAlbum
      : after.kind === 'slot'
        ? t.path.nextRound.replace('{n}', String(after.slot + 1))
        : t.roundEnd.nextRound;

  const handleNextRound = () => {
    playClick();
    if (after.kind === 'album') {
      void navigate('/album', { replace: true });
    } else if (after.kind === 'slot') {
      // GameRoute starts the round, the same game included.
      void navigate(pathRoundUrl(after.gameId, after.slot), { replace: true });
    } else {
      if (gameType) recordGameStart(gameType);
      startNextRound(after.pathSlot);
    }
  };

  const handleMenu = () => {
    playClick();
    void navigate('/', { replace: true });
  };

  return (
    <div
      data-testid="round-end"
      className="theme-shell fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-paper px-4 py-8 animate-in fade-in"
    >
      <div className="round-end-rise my-auto w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4">
            {dayDone && todayPath ? (
              <div data-testid="path-day-stickers" className="flex items-center gap-3">
                {todayPath.slots.map((slot, i) => (
                  <Sticker key={i} id={slot.stickerId} size={84} tilt={[-5, 4, -3][i]} />
                ))}
              </div>
            ) : result.path ? (
              <Sticker id={result.path.stickerId} size={140} tilt={-6} />
            ) : reached ? (
              <Trophy size={40} className="text-star" aria-hidden />
            ) : (
              <HeartCrack size={40} className="text-heart" aria-hidden />
            )}
          </div>
          {gameTitle && <p className="fam-label mb-1">{formatText(gameTitle)}</p>}
          <h2 className="fam-title">{formatText(dayDone ? t.path.dayDone : title)}</h2>
          {result.path && !dayDone && (
            <p data-testid="path-sticker" className="mt-3 text-lg font-semibold text-ink">
              {formatText(
                t.path.newSticker.replace('{sticker}', stickerName(t, result.path.stickerId)),
              )}
            </p>
          )}
          {dayDone && result.path?.dayStreak && (
            <>
              <p
                data-testid="path-day-streak"
                className="mt-4 flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--star)_14%,var(--surface))] px-4 py-3 text-xl font-semibold text-ink"
              >
                <Flame size={26} aria-hidden className="fill-star text-star" />
                {formatText(streakText(t, result.path.dayStreak))}
              </p>
              <p className="mt-2 text-[15px] text-ink-2">{formatText(t.path.tomorrow)}</p>
            </>
          )}
          {result.starsEarned > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-lg font-semibold text-ink">
              <Star size={20} aria-hidden className="fill-star text-star" />
              {formatText(
                result.starsEarned === 1
                  ? t.roundEnd.starsEarned_one
                  : t.roundEnd.starsEarned_other,
              ).replace('{count}', String(result.starsEarned))}
            </p>
          )}
          {!isTimed && (
            <p
              data-testid="round-end-level"
              className={
                line.kind === 'leveledUp'
                  ? 'level-up-moment relative mt-4 flex items-center gap-3 rounded-xl border-2 border-study bg-[color-mix(in_srgb,var(--study)_12%,var(--surface))] px-4 py-3 text-xl font-semibold text-ink'
                  : 'mt-2 text-[15px] text-ink-2'
              }
            >
              {line.kind === 'leveledUp' && (
                <>
                  <ArrowUp size={24} aria-hidden className="text-study" />
                  <Star
                    size={20}
                    aria-hidden
                    className="absolute -top-2.5 right-3 fill-star text-star"
                  />
                  <Star
                    size={13}
                    aria-hidden
                    className="absolute -bottom-2 right-10 fill-star text-star"
                  />
                  <Star
                    size={11}
                    aria-hidden
                    className="absolute -top-1.5 right-16 fill-star text-star"
                  />
                </>
              )}
              {formatText(levelLine)}
            </p>
          )}
          {isTimed && !reached && (
            <p className="mt-2 text-[15px] text-ink-2">{formatText(t.roundEnd.timedGoal)}</p>
          )}
        </div>

        {result.achievements.length > 0 && (
          <ul className="mb-6 border-t border-rule">
            {result.achievements.map((a) => (
              <li
                key={a.id}
                data-testid="round-end-achievement"
                className="fam-row flex items-center gap-3 px-2 py-3"
              >
                <AchievementSticker icon={a.icon} size={44} />
                <span className="flex flex-col">
                  <span className="font-semibold text-ink">{formatText(a.title)}</span>
                  <span className="text-sm text-ink-2">
                    {formatText(t.roundEnd.newAchievement)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {isSnakeGameType(gameType) && <SnakeSessionSummary stats={snakeSessionStats} />}

        <StatPair
          left={{ label: formatText(t.game.score), value: score }}
          right={{
            label: formatText(t.game.highScore),
            value: highScore > 0 ? highScore : '-',
            note: isNewRecord ? formatText(t.game.newRecord) : undefined,
          }}
        />

        {isTimed && (
          <StatPair
            left={{ label: formatText(t.gameScreen.factDrill.bestStreakLabel), value: bestStreak }}
            right={{
              label: formatText(t.gameScreen.factDrill.finalAccuracyLabel),
              value: `${roundAccuracy(round)}%`,
            }}
          />
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleNextRound}
            className="fam-btn fam-btn-primary flex-1"
          >
            {formatText(nextLabel)}
          </button>
          <button type="button" onClick={handleMenu} className="fam-btn flex-1">
            {formatText(t.game.returnToMenu)}
          </button>
        </div>
      </div>
    </div>
  );
};

interface Stat {
  label: string;
  value: string | number;
  note?: string;
}

const StatCell: React.FC<{ stat: Stat; className?: string }> = ({ stat, className = '' }) => (
  <div className={`px-4 text-center ${className}`}>
    <div className="fam-label mb-1">{stat.label}</div>
    <div className="flex items-baseline justify-center gap-1.5">
      <span className="text-3xl font-semibold text-ink tabular-nums">{stat.value}</span>
      {stat.note && <span className="text-sm font-semibold text-star">{stat.note}</span>}
    </div>
  </div>
);

const StatPair: React.FC<{ left: Stat; right: Stat }> = ({ left, right }) => (
  <div className="mb-8 grid grid-cols-2 border-y border-rule py-4">
    <StatCell stat={left} />
    <StatCell stat={right} className="border-l border-rule" />
  </div>
);
