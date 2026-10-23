import React from 'react';
import { Lightbulb } from 'lucide-react';
import { playSound } from '../engine/audio';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';
import { Z_INDEX } from '../utils/zIndex';

interface TipButtonProps {
  onTip?: () => void;
  soundEnabled: boolean;
  disabled?: boolean;
  placement?: 'fixed' | 'inline';
}

export const TipButton: React.FC<TipButtonProps> = ({
  onTip,
  soundEnabled,
  disabled = false,
  placement = 'fixed',
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const label = formatText(
    disabled ? t.gameScreen.tipButton.unavailable : t.gameScreen.tipButton.show,
  );

  const handleClick = (): void => {
    if (disabled) return;
    playSound('click', soundEnabled);
    if (onTip) onTip();
  };

  const placementClass = placement === 'inline' ? 'bg-surface' : 'fixed bottom-4 left-4 bg-surface';

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`fam-icon-btn ${placementClass} transition-colors enabled:active:bg-sunken`}
      style={placement === 'fixed' ? { zIndex: Z_INDEX.HINTS } : undefined}
      aria-label={label}
      title={label}
    >
      <Lightbulb size={22} aria-hidden />
    </button>
  );
};
