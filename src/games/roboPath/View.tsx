/**
 * RoboPathView Component
 *
 * Game view for robot path programming games.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { ControlPad } from '../../components/ControlPad';
import { GAME_CONFIG } from '../data';
import { AppModal, PaidHintButtons } from '../../components/shared';
import type { RoboPathProblem } from '../../types/game';

type AnswerHandler = (answer: boolean) => void;

interface RoboPathViewProps {
  problem: RoboPathProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

export const RoboPathView: React.FC<RoboPathViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const baseType = gameType?.replace('_adv', '') ?? 'robo_path';
  const paidHints = GAME_CONFIG[baseType]?.paidHints ?? [];
  const [commands, setCommands] = useState<string[]>([]);
  const [robotPos, setRobotPos] = useState<[number, number]>(problem.start);
  const [robotDirection, setRobotDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('DOWN');
  const [status, setStatus] = useState<'planning' | 'moving' | 'crash' | 'win' | 'notReached'>(
    'planning',
  );
  const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(-1);
  const [showHintMarker, setShowHintMarker] = useState<boolean>(false);
  const [showRetryModal, setShowRetryModal] = useState<boolean>(false);
  const [finalMoves, setFinalMoves] = useState<number>(0);
  const coalPos = problem.coal ?? problem.coins?.[0];
  const maxCommands = problem.maxCommands ?? 8;
  const commandCount = commands.length;

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problem.uid);
  if (lastSyncedUid !== problem.uid) {
    setLastSyncedUid(problem.uid);
    setCommands([]);
    setRobotPos(problem.start);
    setRobotDirection('DOWN');
    setStatus('planning');
    setCurrentCommandIndex(-1);
    setShowHintMarker(false);
    setShowRetryModal(false);
    setFinalMoves(0);
  }

  const addCommand = useCallback(
    (cmd: string): void => {
      if (status !== 'planning' || commandCount >= maxCommands) return;
      playSound('click', soundEnabled);
      setCommands((prev) => [...prev, cmd]);
    },
    [status, commandCount, maxCommands, soundEnabled],
  );

  const removeCommand = useCallback(() => {
    if (status !== 'planning' || commandCount === 0) return;
    playSound('click', soundEnabled);
    setCommands((prev) => prev.slice(0, -1));
  }, [status, commandCount, soundEnabled]);

  const runSimulation = useCallback(async (): Promise<void> => {
    if (commandCount === 0) return;
    setStatus('moving');
    playSound('click', soundEnabled);

    const currentPos: [number, number] = [problem.start[0], problem.start[1]];
    let currentDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'DOWN';

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      setCurrentCommandIndex(i);
      await new Promise((r) => setTimeout(r, 400));

      let newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = currentDir;
      if (cmd === 'UP') {
        currentPos[1] = Math.max(0, currentPos[1] - 1);
        newDir = 'UP';
      }
      if (cmd === 'DOWN') {
        currentPos[1] = Math.min(problem.gridSize - 1, currentPos[1] + 1);
        newDir = 'DOWN';
      }
      if (cmd === 'LEFT') {
        currentPos[0] = Math.max(0, currentPos[0] - 1);
        newDir = 'LEFT';
      }
      if (cmd === 'RIGHT') {
        currentPos[0] = Math.min(problem.gridSize - 1, currentPos[0] + 1);
        newDir = 'RIGHT';
      }

      currentDir = newDir;
      setRobotDirection(newDir);
      setRobotPos([currentPos[0], currentPos[1]]);

      if (problem.obstacles.some((o) => o[0] === currentPos[0] && o[1] === currentPos[1])) {
        setStatus('crash');
        setShowHintMarker(true);
        playSound('wrong', soundEnabled);
        // Call onAnswer immediately for instant feedback
        onAnswer(false);
        // Reset state after animation completes
        setTimeout(() => {
          setRobotPos(problem.start);
          setRobotDirection('DOWN');
          setCommands([]);
          setStatus('planning');
          setCurrentCommandIndex(-1);
        }, 2000);
        return;
      }
    }

    setCurrentCommandIndex(-1);

    const goalPos = problem.end || problem.goal;
    if (currentPos[0] === goalPos[0] && currentPos[1] === goalPos[1]) {
      const movesUsed = commands.length;
      const optimal =
        problem.optimalMoves ||
        Math.abs(goalPos[0] - problem.start[0]) + Math.abs(goalPos[1] - problem.start[1]);
      const isPerfect = movesUsed === optimal;

      setStatus('win');
      playSound('correct', soundEnabled);
      setFinalMoves(movesUsed);

      // If perfect route, proceed immediately
      if (isPerfect) {
        onAnswer(true);
      } else {
        // Show retry modal for non-perfect routes
        setShowRetryModal(true);
      }
    } else {
      setStatus('notReached');
      setShowHintMarker(true);
      playSound('wrong', soundEnabled);
      // Call onAnswer immediately for instant feedback
      onAnswer(false);
      // Reset state after animation completes
      setTimeout(() => {
        setRobotPos(problem.start);
        setRobotDirection('DOWN');
        setCommands([]);
        setStatus('planning');
        setCurrentCommandIndex(-1);
      }, 2000);
    }
  }, [
    commands,
    commandCount,
    problem.start,
    problem.end,
    problem.goal,
    problem.gridSize,
    problem.obstacles,
    problem.optimalMoves,
    soundEnabled,
    onAnswer,
  ]);

  // Keyboard support
  useEffect(() => {
    if (status !== 'planning') return;

    const handleKeyPress = (e: KeyboardEvent): void => {
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      )
        return;

      let command: string | null = null;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        command = 'UP';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        command = 'DOWN';
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        command = 'LEFT';
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        command = 'RIGHT';
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        command = 'UP';
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        command = 'DOWN';
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        command = 'LEFT';
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        command = 'RIGHT';
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && commandCount > 0) {
        e.preventDefault();
        removeCommand();
        return;
      } else if ((e.key === 'Enter' || e.key === ' ') && commandCount > 0) {
        e.preventDefault();
        void runSimulation();
        return;
      }

      if (command && commandCount < maxCommands) {
        addCommand(command);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [status, commandCount, maxCommands, addCommand, removeCommand, runSimulation]);

  const renderCell = (x: number, y: number): React.ReactNode => {
    const isRobot = robotPos[0] === x && robotPos[1] === y;
    const isStart = problem.start[0] === x && problem.start[1] === y;
    const isEnd =
      (problem.end?.[0] ?? problem.goal?.[0]) === x &&
      (problem.end?.[1] ?? problem.goal?.[1]) === y;
    const isRock = problem.obstacles.some((o) => o[0] === x && o[1] === y);
    const isCoal = showHintMarker && coalPos?.[0] === x && coalPos?.[1] === y && !isEnd;

    // Robot rotation based on direction
    const robotRotation =
      robotDirection === 'UP'
        ? 'rotate-0'
        : robotDirection === 'RIGHT'
          ? 'rotate-90'
          : robotDirection === 'DOWN'
            ? 'rotate-180'
            : 'rotate-[270deg]';

    return (
      <div
        key={`${x}-${y}`}
        className={`relative w-full aspect-square bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-emerald-200 rounded-lg flex items-center justify-center text-3xl shadow-sm overflow-hidden transition-all duration-300 ${
          status === 'crash' && isRobot ? 'bg-red-200 animate-pulse' : ''
        } ${isStart ? 'ring-2 ring-emerald-400' : ''} ${isEnd ? 'ring-2 ring-amber-400' : ''}`}
      >
        {isEnd && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-4 border-green-400 rounded-lg">
            <div className="text-4xl animate-pulse drop-shadow-lg">🔋</div>
            <div className="absolute inset-0 bg-green-300 opacity-20 rounded-full blur-xl animate-pulse"></div>
          </div>
        )}
        {isRock && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center rounded-lg shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.4),inset_2px_2px_8px_rgba(255,255,255,0.1),4px_4px_12px_rgba(0,0,0,0.5)] border-2 border-gray-700 transform hover:scale-105 transition-transform">
            <div className="text-3xl drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">🪨</div>
          </div>
        )}
        {isCoal && !isRock && (
          <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-yellow-200 via-amber-200 to-orange-200 border-2 border-amber-400 shadow-[inset_-2px_-2px_6px_rgba(251,191,36,0.45),inset_2px_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center">
            <div className="text-lg drop-shadow-lg">⚡</div>
          </div>
        )}
        {isRobot && (
          <div
            className={`absolute inset-0 flex items-center justify-center z-10 text-4xl transition-all duration-300 drop-shadow-2xl ${robotRotation} ${status === 'crash' ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
          >
            🤖
          </div>
        )}
        {status === 'crash' && isRobot && (
          <div className="absolute inset-0 flex items-center justify-center z-20 text-5xl animate-ping">
            💥
          </div>
        )}
      </div>
    );
  };

  const getCommandColor = (cmd: string): string => {
    if (cmd === 'UP') return 'bg-blue-500 border-blue-700';
    if (cmd === 'DOWN') return 'bg-red-500 border-red-700';
    if (cmd === 'LEFT') return 'bg-yellow-500 border-yellow-700';
    if (cmd === 'RIGHT') return 'bg-green-500 border-green-700';
    return 'bg-white border-indigo-200';
  };

  const handleRetry = useCallback(() => {
    setShowRetryModal(false);
    setCommands([]);
    setRobotPos(problem.start);
    setRobotDirection('DOWN');
    setStatus('planning');
    setCurrentCommandIndex(-1);
    setShowHintMarker(false);
  }, [problem.start]);

  const handleContinue = useCallback(() => {
    setShowRetryModal(false);
    onAnswer(true);
  }, [onAnswer]);

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      {/* Retry Modal */}
      {showRetryModal && (
        <AppModal
          labelledBy="robo-path-retry-title"
          onClose={handleRetry}
          closeOnBackdrop={false}
          closeOnEscape={false}
          size="md"
          contentClassName="p-6 sm:p-8"
        >
          <div className="text-center mb-4">
            <div className="text-4xl mb-3">🎯</div>
            <h3
              id="robo-path-retry-title"
              className="text-xl sm:text-2xl font-black text-slate-800 mb-2"
            >
              {formatText(t.roboPath.greatJob)}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mb-4">
              {formatText(t.roboPath.youUsed)} {finalMoves} {formatText(t.roboPath.commands)}.
              {problem.optimalMoves && (
                <span className="block mt-2">
                  {formatText(t.roboPath.optimalIs)} {problem.optimalMoves}.
                </span>
              )}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {formatText(t.roboPath.tryAgainForBetter)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg"
            >
              {formatText(t.roboPath.tryAgainButton)}
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg"
            >
              {formatText(t.roboPath.continueButton)}
            </button>
          </div>
        </AppModal>
      )}

      <div className="w-full mb-2 text-[10px] sm:text-xs font-semibold text-slate-500 flex flex-wrap items-center justify-center gap-2">
        <span className="flex items-center gap-1">🤖 {t.roboPath.legendStart}</span>
        <span>•</span>
        <span className="flex items-center gap-1">🪨 {t.roboPath.legendObstacle}</span>
        <span>•</span>
        <span className="flex items-center gap-1">🔋 {t.roboPath.legendGoal}</span>
        {showHintMarker && coalPos && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1">⚡ {t.roboPath.legendHint}</span>
          </>
        )}
      </div>

      {/* Grid */}
      <div
        className="grid gap-1 sm:gap-2 w-full mb-2 sm:mb-4 bg-gradient-to-br from-green-100 to-emerald-200 p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-emerald-300 shadow-inner"
        style={{ gridTemplateColumns: `repeat(${problem.gridSize}, 1fr)` }}
      >
        {Array.from({ length: problem.gridSize * problem.gridSize }).map((_, i) =>
          renderCell(i % problem.gridSize, Math.floor(i / problem.gridSize)),
        )}
      </div>

      {/* Command queue with colors and indices */}
      <div className="w-full mb-2 sm:mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs sm:text-sm font-semibold text-slate-600">
            {formatText(t.roboPath.commands)}: {commandCount}/{maxCommands}
          </span>
          {commandCount >= maxCommands - 1 && commandCount < maxCommands && (
            <span className="text-xs text-amber-600 font-semibold">
              ⚠️ {maxCommands - commandCount} {formatText(t.roboPath.steps)}
            </span>
          )}
        </div>
        <div className="flex gap-1 min-h-10 sm:min-h-12 w-full bg-slate-100 rounded-lg sm:rounded-xl items-center px-2 py-2 overflow-x-auto border-2 border-slate-300 shadow-inner">
          {commandCount === 0 && (
            <span className="text-slate-400 text-xs sm:text-sm ml-2">
              {formatText(t.roboPath.addCommands)}
            </span>
          )}
          {commands.map((c, i) => (
            <div key={i} className="relative flex-shrink-0">
              <div
                className={`min-w-[2rem] sm:min-w-[2.5rem] h-8 sm:h-10 ${getCommandColor(c)} text-white rounded-lg flex items-center justify-center font-black shadow-md text-base sm:text-xl border-b-4 transform transition-all ${currentCommandIndex === i ? 'scale-110 ring-4 ring-yellow-400 animate-pulse' : ''}`}
              >
                {c === 'UP' ? '⬆' : c === 'DOWN' ? '⬇' : c === 'LEFT' ? '⬅' : '➡'}
              </div>
              <div className="absolute -top-1 -right-1 bg-white text-[8px] sm:text-[10px] font-bold text-slate-600 rounded-full w-4 h-4 flex items-center justify-center border border-slate-300">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex flex-col gap-3 w-full">
        <ControlPad
          onUp={() => addCommand('UP')}
          onDown={() => addCommand('DOWN')}
          onLeft={() => addCommand('LEFT')}
          onRight={() => addCommand('RIGHT')}
          disabled={status !== 'planning' || commandCount >= maxCommands}
          className="mx-auto"
        />
        <div className="flex gap-2 w-full">
          <button
            onClick={removeCommand}
            aria-label={t.roboPath.removeCommand}
            disabled={status !== 'planning' || commandCount === 0}
            className="flex-1 h-12 sm:h-14 bg-orange-400 border-b-4 border-orange-600 text-white rounded-2xl flex items-center justify-center active:translate-y-1 hover:bg-orange-500 transition-all disabled:bg-gray-300 disabled:border-gray-400 shadow-lg"
          >
            <RotateCcw size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => void runSimulation()}
            aria-label={t.roboPath.runRobot}
            disabled={status !== 'planning' || commandCount === 0}
            className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-green-500 to-emerald-600 border-b-4 border-green-800 text-white font-black rounded-2xl flex items-center justify-center active:translate-y-1 shadow-xl gap-1 sm:gap-2 text-sm sm:text-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:border-gray-500"
          >
            {t.roboPath.runRobot} <Play size={18} fill="white" className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
      {paidHints.length > 0 && (
        <PaidHintButtons hints={paidHints} stars={stars ?? 0} onHintClick={() => {}} />
      )}
    </div>
  );
};
