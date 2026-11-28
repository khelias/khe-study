/**
 * Today's path at the top of the menu:
 * three rounds on a line, the done ones with their sticker, the next one to
 * play, the streak and the album.
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, BookImage } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { menuPicture } from '../../games/menuPictures';
import { nextSlot, streakOn } from '../../meta/path';
import { Sticker } from '../../components/stickers/Sticker';
import { gameTitle, streakText } from './gameTitle';
import { useUnlockedAchievementCopies } from '../../hooks/useUnlockedAchievementCopies';
import { focusTopic } from './focusTopic';
import type { PathSlot } from '../../meta/types';

interface TodayPathProps {
  layout: 'phone' | 'desktop';
  onPlay: (slot: number, gameId: string) => void;
}

export const TodayPath: React.FC<TodayPathProps> = ({ layout, onPlay }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const meta = useGameStore((state) => state.activeLearnerProfile.meta);
  const learnerId = useGameStore((state) => state.activeLearnerId);
  const ensureTodayPath = useGameStore((state) => state.ensureTodayPath);
  const achievementStickers = useUnlockedAchievementCopies().enriched;

  useEffect(() => {
    ensureTodayPath();
    // An installed app resumed the next morning keeps its menu mounted.
    const refresh = () => {
      if (document.visibilityState === 'visible') ensureTodayPath();
    };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [ensureTodayPath, learnerId]);

  const path = meta.path;
  if (!path) return null;

  const next = nextSlot(path);
  const streak = streakOn(meta, path.day);
  const titleOf = (gameId: string) => formatText(gameTitle(t, gameId));

  const streakLine = streak > 0 && (
    <span
      data-testid="path-streak"
      className="flex items-center gap-1.5 text-[15px] font-semibold text-star"
    >
      <Flame size={18} aria-hidden className="fill-star" />
      {formatText(streakText(t, streak))}
    </span>
  );
  const albumCount = meta.album.length + achievementStickers.length;
  const albumLink = (
    <Link to="/album" className="fam-btn-quiet text-[15px] font-semibold text-ink">
      <BookImage size={18} aria-hidden />
      <span>{formatText(t.album.title)}</span>
      <span className="font-normal text-muted">
        {formatText(
          (albumCount === 1 ? t.album.count_one : t.album.count_other).replace(
            '{count}',
            String(albumCount),
          ),
        )}
      </span>
    </Link>
  );
  const playButton = (gameId: string, slot: number, className: string) => (
    <button
      type="button"
      onClick={() => onPlay(slot, gameId)}
      aria-label={formatText(t.path.playGame.replace('{game}', titleOf(gameId)))}
      className={`fam-btn fam-btn-primary ${className}`}
    >
      {formatText(t.path.play)}
    </button>
  );

  const slotState = (slot: PathSlot, index: number) =>
    slot.stickerId !== null ? 'done' : index === next ? 'next' : 'later';

  return (
    <section data-testid="today-path" aria-labelledby="today-path-title" className="mb-6 w-full">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 id="today-path-title" className="fam-title">
          {formatText(next === null ? t.path.dayDone : t.path.title)}
        </h1>
        <div className="flex items-center gap-4">
          {streakLine}
          {layout === 'desktop' && albumLink}
        </div>
      </div>
      {meta.focus && (
        <p data-testid="path-focus" className="-mt-1 mb-3 text-[15px] text-ink-2">
          {formatText(t.path.focusLine.replace('{topic}', focusTopic(t, meta.focus)))}
        </p>
      )}

      {layout === 'desktop' ? (
        <ol className="grid grid-cols-3 gap-4">
          {path.slots.map((slot, index) => {
            const state = slotState(slot, index);
            const Picture = menuPicture(slot.gameId);
            return (
              <li
                key={index}
                data-testid={`path-slot-${index}`}
                data-state={state}
                className={`flex items-center gap-4 rounded-xl p-4 ${
                  state === 'next'
                    ? 'border-2 border-ink bg-surface'
                    : state === 'done'
                      ? 'border-2 border-study bg-surface'
                      : 'border-2 border-dashed border-rule-strong'
                }`}
              >
                {state === 'done' ? (
                  <Sticker id={slot.stickerId} size={72} />
                ) : (
                  <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-sunken">
                    {Picture && <Picture className="h-12 w-14" />}
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="fam-label">
                    {formatText(
                      (state === 'done' ? t.path.roundDone : t.path.round).replace(
                        '{n}',
                        String(index + 1),
                      ),
                    )}
                  </span>
                  <span className="truncate text-lg font-semibold">{titleOf(slot.gameId)}</span>
                </span>
                {state === 'next' && playButton(slot.gameId, index, 'shrink-0 px-5')}
              </li>
            );
          })}
        </ol>
      ) : (
        <>
          <ol className="relative flex items-start justify-between px-1">
            <span aria-hidden className="absolute left-12 right-12 top-11 h-[3px] bg-rule-strong" />
            {path.slots.map((slot, index) => {
              const state = slotState(slot, index);
              const Picture = menuPicture(slot.gameId);
              return (
                <li
                  key={index}
                  data-testid={`path-slot-${index}`}
                  data-state={state}
                  className="relative flex w-24 flex-col items-center gap-2 text-center"
                >
                  {state === 'done' ? (
                    <Sticker id={slot.stickerId} size={88} />
                  ) : (
                    <span
                      className={`flex h-[88px] w-[88px] items-center justify-center rounded-full ${
                        state === 'next'
                          ? 'border-[3px] border-ink bg-surface'
                          : 'border-2 border-dashed border-rule-strong bg-sunken'
                      }`}
                    >
                      {Picture && (
                        <Picture className={`h-12 w-14 ${state === 'later' ? 'opacity-50' : ''}`} />
                      )}
                    </span>
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      state === 'done' ? 'text-study' : state === 'next' ? 'text-ink' : 'text-muted'
                    }`}
                  >
                    {state === 'done' ? formatText(t.path.done) : titleOf(slot.gameId)}
                  </span>
                </li>
              );
            })}
          </ol>
          {next !== null && playButton(path.slots[next]!.gameId, next, 'mt-4 w-full')}
          <div className="mt-2 -ml-2">{albumLink}</div>
        </>
      )}
    </section>
  );
};
