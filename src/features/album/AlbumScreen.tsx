/**
 * The album: the path stickers in the order they
 * were earned, each saying where and when it came from, with the rest of the
 * current set as empty places, then a sticker for each achievement.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { getLocale } from '../../i18n';
import { ACHIEVEMENTS } from '../../engine/achievements';
import { useUnlockedAchievementCopies } from '../../hooks/useUnlockedAchievementCopies';
import { localDay, previousDay } from '../../meta/path';
import { PATH_STICKER_IDS } from '../../meta/stickers';
import { AchievementSticker, Sticker } from '../../components/stickers/Sticker';
import { gameTitle, stickerName } from '../menu/gameTitle';

const TILTS = [-4, 3, -2, 4, -3, 2];

export const AlbumScreen: React.FC = () => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const meta = useGameStore((state) => state.activeLearnerProfile.meta);

  // The day the page opened on; a reload after midnight moves it.
  const [today] = useState(() => localDay(Date.now()));
  const when = (earnedAt: number) => {
    const day = localDay(earnedAt);
    if (day === today) return t.album.today;
    if (day === previousDay(today)) return t.album.yesterday;
    return new Date(earnedAt).toLocaleDateString(getLocale(), { day: 'numeric', month: 'long' });
  };

  const set = PATH_STICKER_IDS.length;
  const pathPlaces = Math.max(set, Math.ceil((meta.album.length + 1) / set) * set);
  const earned = useUnlockedAchievementCopies().enriched;
  const achievementPlaces = Object.keys(ACHIEVEMENTS).length;

  const heading = (title: string, count: number, places: number, id: string) => (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 id={id} className="fam-heading">
        {formatText(title)}
      </h2>
      <span className="text-sm tabular-nums text-muted">
        {count} / {places}
      </span>
    </div>
  );
  const empty = (key: string) => (
    <li key={key} className="flex justify-center">
      <Sticker id={null} size={84} />
    </li>
  );

  return (
    <div className="h-full overflow-y-auto overscroll-contain app-bg font-sans">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-5 sm:pt-6">
        <Link to="/" className="fam-btn-quiet mb-3 -ml-2 text-[15px] font-semibold text-ink">
          <ArrowLeft size={18} aria-hidden />
          <span>{formatText(t.album.back)}</span>
        </Link>
        <h1 className="fam-title mb-6">{formatText(t.album.title)}</h1>

        <section aria-labelledby="album-path" className="mb-8">
          {heading(t.album.pathStickers, meta.album.length, pathPlaces, 'album-path')}
          <ol className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5">
            {meta.album.map((sticker, index) => (
              <li
                key={`${sticker.earnedAt}-${index}`}
                data-testid="album-sticker"
                className="flex flex-col items-center gap-2 text-center"
              >
                <Sticker id={sticker.stickerId} size={84} tilt={TILTS[index % TILTS.length]} />
                <span className="text-sm font-semibold">
                  {formatText(stickerName(t, sticker.stickerId))}
                </span>
                <span className="-mt-1.5 text-xs text-muted">
                  {formatText(`${gameTitle(t, sticker.gameId)}, ${when(sticker.earnedAt)}`)}
                </span>
              </li>
            ))}
            {Array.from({ length: pathPlaces - meta.album.length }, (_, i) => empty(`p${i}`))}
          </ol>
        </section>

        <section aria-labelledby="album-achievements">
          {heading(
            t.album.achievementStickers,
            earned.length,
            achievementPlaces,
            'album-achievements',
          )}
          <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5">
            {earned.map((achievement) => (
              <li
                key={achievement.id}
                data-testid="album-achievement"
                className="flex flex-col items-center gap-2 text-center"
              >
                <AchievementSticker icon={achievement.icon} size={84} />
                <span className="text-sm font-semibold">{formatText(achievement.title)}</span>
              </li>
            ))}
            {Array.from({ length: achievementPlaces - earned.length }, (_, i) => empty(`a${i}`))}
          </ul>
        </section>
      </div>
    </div>
  );
};
