import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { getGameTips } from '../../hooks/useGameTips';
import { useProfileText } from '../../hooks/useProfileText';
import { GAME_CONFIG } from '../../games/data';
import { AppModal } from '../../components/shared';

interface GameDescriptionModalProps {
  gameType: string;
  onClose: () => void;
}

/**
 * "How to play" modal shown on first game entry (auto) and when
 * the player taps the game-name badge.
 *
 * `onClose` is expected to carry whatever sound/animation effects
 * the parent needs (e.g. playClick); this component just invokes it.
 */
export const GameDescriptionModal: React.FC<GameDescriptionModalProps> = ({
  gameType,
  onClose,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();

  const gameConfig = GAME_CONFIG[gameType];
  const gameEmoji = gameConfig?.emoji ?? '🎮';
  const gameTitleStr: string =
    gameConfig && t.games[gameType as keyof typeof t.games]
      ? t.games[gameType as keyof typeof t.games].title
      : gameType.toUpperCase();
  const gameName = formatText(gameTitleStr);
  const gameDesc = (t.games[gameType as keyof typeof t.games] as { gameDescription?: string })
    ?.gameDescription;
  const tipsList = getGameTips(t, gameType);

  return (
    <AppModal
      labelledBy="game-description-title"
      onClose={onClose}
      size="md"
      panelClassName="border-2 bg-gradient-to-br from-slate-50 via-white to-slate-50"
      contentClassName="p-5 sm:p-6"
    >
      <h2
        id="game-description-title"
        className="text-lg sm:text-xl font-black text-slate-800 mb-2 flex items-center gap-2"
      >
        <span>{gameEmoji}</span>
        {gameName}
      </h2>
      <p className="text-sm text-slate-700 mb-4 whitespace-pre-wrap">
        {gameDesc ? formatText(gameDesc) : ''}
      </p>
      {tipsList.length > 0 && (
        <>
          <h3 className="text-sm font-bold text-slate-700 mb-2">
            {formatText(t.gameScreen.tipsLabel)}
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 mb-4">
            {tipsList.map((tip, i) => (
              <li key={i}>{formatText(tip)}</li>
            ))}
          </ul>
        </>
      )}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 rounded-xl font-bold border-2 border-slate-600 bg-slate-600 text-white hover:bg-slate-700 transition-colors"
        aria-label={formatText(t.common.close)}
      >
        {formatText(t.common.close)}
      </button>
    </AppModal>
  );
};
