import React, { useLayoutEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './engine/errorBoundary';
import { usePlaySessionStore } from './stores/playSessionStore';
import { MenuScreen } from './features/menu/MenuScreen';
import { GameRoute } from './features/routing/GameRoute';
import { LocaleInUrl } from './features/routing/LocaleInUrl';
import { StudySiteHeader } from './components/StudySiteHeader';
import { ThemeApplier } from './features/theme/ThemeApplier';

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
  return (
    <ErrorBoundary>
      <ThemeApplier />
      <LocaleInUrl />
      <div className="flex h-dvh flex-col overflow-hidden app-bg font-sans">
        <StudySiteHeader />
        <div className="min-h-0 flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<MenuRoute />} />
            <Route path="/games/:gameSlug" element={<GameRoute />} />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
