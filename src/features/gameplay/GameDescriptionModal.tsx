import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { getGameTips } from '../../hooks/useGameTips';
import { useProfileText } from '../../hooks/useProfileText';
import { GAME_CONFIG } from '../../games/data';
import { AppModal } from '../../components/shared';
import { GameIcon } from '../../components/gameIcons';

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
      contentClassName="p-5 sm:p-6"
    >
      <h2 id="game-description-title" className="fam-heading mb-2 flex items-center gap-2">
        <GameIcon name={gameConfig?.icon} size={20} className="shrink-0 text-muted" aria-hidden />
        {gameName}
      </h2>
      <p className="text-[15px] text-ink-2 mb-4 whitespace-pre-wrap">
        {gameDesc ? formatText(gameDesc) : ''}
      </p>
      {tipsList.length > 0 && (
        <>
          <h3 className="fam-label mb-2">{formatText(t.gameScreen.tipsLabel)}</h3>
          <ul className="list-disc list-inside text-[15px] text-ink-2 space-y-1 mb-5">
            {tipsList.map((tip, i) => (
              <li key={i}>{formatText(tip)}</li>
            ))}
          </ul>
        </>
      )}
      <button
        type="button"
        onClick={onClose}
        className="fam-btn fam-btn-primary w-full"
        aria-label={formatText(t.common.close)}
      >
        {formatText(t.common.close)}
      </button>
    </AppModal>
  );
};
