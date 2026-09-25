import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './engine/errorBoundary';
import { usePlaySessionStore } from './stores/playSessionStore';
import { MenuScreen } from './features/menu/MenuScreen';
import { GameScreen } from './features/gameplay/GameScreen';
import { GameResultScreen } from './features/gameplay/GameResultScreen';
import { GameRoute } from './features/routing/GameRoute';
import { StudySiteHeader } from './components/StudySiteHeader';
import { ThemeApplier } from './features/theme/ThemeApplier';

const App: React.FC = () => {
  const gameState = usePlaySessionStore((state) => state.gameState);

  return (
    <ErrorBoundary>
      <ThemeApplier />
      <div className="flex h-dvh min-h-screen flex-col overflow-hidden app-bg font-sans">
        <StudySiteHeader />
        <div className="min-h-0 flex-1 overflow-hidden">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {gameState === 'menu' && <MenuScreen />}
                  {gameState === 'playing' && <GameScreen />}
                  {gameState === 'game_over' && <GameResultScreen type="gameOver" />}
                </>
              }
            />
            <Route path="/games/:gameSlug" element={<GameRoute />} />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
