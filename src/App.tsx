import React, { useLayoutEffect } from 'react';
import { Routes, Route, useMatch } from 'react-router-dom';
import { ErrorBoundary } from './engine/errorBoundary';
import { usePlaySessionStore } from './stores/playSessionStore';
import { MenuScreen } from './features/menu/MenuScreen';
import { GameRoute } from './features/routing/GameRoute';
import { LocaleInUrl } from './features/routing/LocaleInUrl';
import { StudySiteHeader } from './components/StudySiteHeader';
import { ThemeApplier } from './features/theme/ThemeApplier';
import { StudyThemeProvider } from './theme/StudyThemeProvider';
import { useCompactPlay } from './hooks/useCompactPlay';

// Games play only under /games/:slug, so reaching / (the back button included) ends the one running.
const MenuRoute: React.FC = () => {
  const gameState = usePlaySessionStore((state) => state.gameState);
  const returnToMenu = usePlaySessionStore((state) => state.returnToMenu);

  // Before paint, so leaving a game shows no blank frame.
  useLayoutEffect(() => {
    if (gameState !== 'menu') returnToMenu();
  }, [gameState, returnToMenu]);

  return gameState === 'menu' ? <MenuScreen /> : null;
};

const App: React.FC = () => {
  const inGame = useMatch('/games/:gameSlug') !== null;
  const compact = useCompactPlay();

  return (
    <ErrorBoundary>
      <ThemeApplier />
      <LocaleInUrl />
      <StudyThemeProvider>
        <div className="flex h-dvh flex-col overflow-hidden app-bg font-sans">
          {/* A phone plays under the game's own bar alone (estate ADR-035 point 11). */}
          {!(inGame && compact) && <StudySiteHeader showThemeToggle={!inGame} />}
          <div className="min-h-0 flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<MenuRoute />} />
              <Route path="/games/:gameSlug" element={<GameRoute />} />
            </Routes>
          </div>
        </div>
      </StudyThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
