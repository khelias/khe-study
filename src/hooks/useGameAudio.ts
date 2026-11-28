import { useCallback } from 'react';
import { playSound } from '../engine/audio';

export function useGameAudio(soundEnabled: boolean) {
  const playClick = useCallback(() => {
    playSound('click', soundEnabled);
  }, [soundEnabled]);

  return { playClick };
}
