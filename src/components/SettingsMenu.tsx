import React, { useEffect, useRef } from 'react';
import { FocusTrap } from './AccessibilityHelpers';
import { BottomSheet } from './shared/BottomSheet';
import { SettingsMenuContent, type SettingsMenuContentProps } from './SettingsMenuContent';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';

export type SettingsMenuProps = SettingsMenuContentProps;

export const SettingsMenu: React.FC<SettingsMenuProps> = (props) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleId = 'settings-menu-title';

  useEffect(() => {
    if (!isDesktop) return undefined;
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        props.onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isDesktop, props]);

  if (!isDesktop) {
    return (
      <BottomSheet open={true} onClose={props.onClose} labelledBy={titleId}>
        <div role="menu" aria-labelledby={titleId}>
          <span id={titleId} className="sr-only">
            {formatText(t.menuSpecific.settingsTitle)}
          </span>
          <SettingsMenuContent {...props} heading={formatText(t.menuSpecific.settingsTitle)} />
        </div>
      </BottomSheet>
    );
  }

  return (
    <FocusTrap active={true}>
      <div
        ref={dropdownRef}
        role="menu"
        aria-labelledby={titleId}
        className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150"
      >
        <span id={titleId} className="sr-only">
          {formatText(t.menuSpecific.settingsTitle)}
        </span>
        <div className="max-h-[80vh] overflow-y-auto">
          <SettingsMenuContent {...props} />
        </div>
      </div>
    </FocusTrap>
  );
};
