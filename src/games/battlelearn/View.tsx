/**
 * BattleLearnView – Battleship-style educational game
 *
 * - Grid: empty, problem, ship, star, heart cells. Only problem cells open the question modal.
 * - Hitting water (empty/star/heart) adds a strike; 5 strikes = lose one heart. Correct answer or sinking a ship resets strikes.
 * - Wrong answer in the modal costs one heart (standard).
 */

import React, { useCallback, useState } from 'react';
import { Target } from 'lucide-react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useWrongStrikes } from '../../hooks/useWrongStrikes';
import { applyShot, checkWinCondition, isShipSunk } from '../../engine/battlelearn';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import { useGameStore } from '../../stores/gameStore';
import type { BattleLearnProblem, BattleLearnCellType, Ship } from '../../types/game';
import { GameProblemModal } from '../../components/shared/GameProblemModal';
import { PaidHintButtons } from '../../components/shared';
import { GameResultScreen } from '../../features/gameplay/GameResultScreen';
import { GAME_CONFIG } from '../data';

const STRIKES_BEFORE_HEART = 5;
const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const CELL_EMOJI = { water: '💧', problem: '❓', hit: '💥', sunk: '🔥' } as const;

function isWaterCell(type: BattleLearnCellType): boolean {
  return type === 'empty' || type === 'star' || type === 'heart';
}

interface BattleLearnViewProps {
  problem: BattleLearnProblem;
  onAnswer: (
    isCorrect: boolean,
    shouldShowAchievement?: () => boolean,
    options?: { skipHeartDeduction?: boolean },
  ) => void;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
  /** When 5 water hits (empty/star/heart) are reached, one heart is spent. */
  spendHeart?: () => void;
  /** Called when hearts reach 0 after spending from 5 water hits. */
  endGame?: () => void;
}

export const BattleLearnView: React.FC<BattleLearnViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  spendStars,
  spendHeart,
  endGame,
}) => {
  const t = useTranslation();
  const setProblem = usePlaySessionStore((state) => state.setProblem);
  const configKey = gameType ?? 'battlelearn';
  const paidHints = GAME_CONFIG[configKey]?.paidHints ?? [];

  const { strikes, addStrike, resetStrikes, triesLeft } = useWrongStrikes({
    maxStrikes: STRIKES_BEFORE_HEART,
    resetDeps: problem.uid,
  });

  // Separate game state from question state
  const [gameState, setGameState] = useState<{
    gridSize: number;
    cellGrid: BattleLearnCellType[][];
    ships: Ship[];
    revealed: Array<[number, number]>;
    hits: Array<[number, number]>;
    sunkShips: string[];
    gameWon: boolean;
  }>({
    gridSize: problem.gridSize,
    cellGrid: problem.cellGrid,
    ships: problem.ships,
    revealed: problem.revealed,
    hits: problem.hits,
    sunkShips: problem.sunkShips,
    gameWon: problem.gameWon,
  });
  const [question, setQuestion] = useState(problem.question);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<'shooting' | 'answering'>('shooting');
  const [currentUid, setCurrentUid] = useState(problem.uid);
  /** Cell that opened the problem modal; when answered correctly, it becomes water */
  const [pendingProblemCell, setPendingProblemCell] = useState<[number, number] | null>(null);
  /** Problem cells that have been answered correctly → show as water (💧) */
  const [answeredProblemCells, setAnsweredProblemCells] = useState<string[]>([]);
  /** Indices of options eliminated in the problem modal (only visible while modal is open); reset per question */
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);

  // Sync state from the problem prop (render-time prop comparison).
  // - Brand new game (different uid AND empty revealed array) -> full reset.
  // - Same game session, new question -> update question + sync board state.
  const [lastSyncedQuestion, setLastSyncedQuestion] = useState(problem.question);
  if (problem.uid !== currentUid || problem.question !== lastSyncedQuestion) {
    const isNewGame = problem.uid !== currentUid && problem.revealed.length === 0;
    setCurrentUid(problem.uid);
    setLastSyncedQuestion(problem.question);

    if (isNewGame) {
      setGameState({
        gridSize: problem.gridSize,
        cellGrid: problem.cellGrid,
        ships: problem.ships,
        revealed: problem.revealed,
        hits: problem.hits,
        sunkShips: problem.sunkShips,
        gameWon: problem.gameWon,
      });
      setQuestion(problem.question);
      setSelectedOption(null);
      setEliminatedIndices([]);
      setAnsweredProblemCells([]);
      setPendingProblemCell(null);
      resetStrikes();
      setGamePhase('shooting');
    } else {
      setQuestion(problem.question);
      setEliminatedIndices([]);
      setGameState((prev) => ({
        ...prev,
        cellGrid: problem.cellGrid,
        revealed: problem.revealed,
        hits: problem.hits,
        sunkShips: problem.sunkShips,
        ships: problem.ships,
        gameWon: problem.gameWon,
      }));
    }
  }

  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (!spendStars) return;

      if (hintId === 'eliminate') {
        if (spendStars(1) === false) return;
        const correctIdx = question.correctIndex;
        const wrongIndices = question.options
          .map((_, i) => i)
          .filter((i) => i !== correctIdx && !eliminatedIndices.includes(i));
        if (wrongIndices.length === 0) return;
        const pick = wrongIndices[Math.floor(Math.random() * wrongIndices.length)]!;
        setEliminatedIndices((prev) => [...prev, pick]);
        playSound('click', soundEnabled);
        return;
      }

      const { gridSize, ships, revealed, hits, sunkShips } = gameState;
      const revealedSet = new Set(revealed.map(([r, c]) => `${r},${c}`));
      const shipCells = new Set<string>();
      for (const ship of ships) {
        for (const pos of ship.positions) {
          shipCells.add(`${pos[0]},${pos[1]}`);
        }
      }

      if (hintId === 'reveal_empty') {
        if (!spendStars(1)) return;
        // Any unrevealed non-ship cell (water: empty, problem, star, heart)
        const waterCells: Array<[number, number]> = [];
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            const key = `${r},${c}`;
            if (!revealedSet.has(key) && !shipCells.has(key)) {
              waterCells.push([r, c]);
            }
          }
        }
        if (waterCells.length === 0) return;
        const [row, col] = waterCells[Math.floor(Math.random() * waterCells.length)]!;
        const newRevealed: Array<[number, number]> = [...revealed, [row, col]];
        setGameState((prev) => ({ ...prev, revealed: newRevealed }));
        setProblem({ ...problem, revealed: newRevealed });
        playSound('click', soundEnabled);
        return;
      }

      if (hintId === 'reveal') {
        if (!spendStars(10)) return;
        const unrevealedShipPositions: Array<[number, number]> = [];
        for (const ship of ships) {
          for (const pos of ship.positions) {
            if (!revealedSet.has(`${pos[0]},${pos[1]}`)) unrevealedShipPositions.push(pos);
          }
        }
        if (unrevealedShipPositions.length === 0) return;
        const [row, col] =
          unrevealedShipPositions[Math.floor(Math.random() * unrevealedShipPositions.length)]!;
        const shipsCopy = JSON.parse(JSON.stringify(ships)) as Ship[];
        const result = applyShot(shipsCopy, revealed, row, col);
        const newRevealed: Array<[number, number]> = [...revealed, [row, col] as [number, number]];
        const newHits: Array<[number, number]> = result.hit
          ? [...hits, [row, col] as [number, number]]
          : hits;
        const newSunkShips = result.sunkShipId ? [...sunkShips, result.sunkShipId] : sunkShips;
        const gameWon = checkWinCondition(shipsCopy);
        setGameState((prev) => ({
          ...prev,
          ships: shipsCopy,
          revealed: newRevealed,
          hits: newHits,
          sunkShips: newSunkShips,
          gameWon,
        }));
        setProblem({
          ...problem,
          revealed: newRevealed,
          hits: newHits,
          sunkShips: newSunkShips,
          ships: shipsCopy,
          gameWon,
        });
        if (result.hit) playSound('success', soundEnabled);
        if (gameWon) setTimeout(() => playSound('success', soundEnabled), 500);
      }
    },
    [
      gameState,
      problem,
      question.correctIndex,
      question.options,
      eliminatedIndices,
      spendStars,
      soundEnabled,
      setProblem,
    ],
  );

  const handleOptionSelect = (index: number) => {
    if (gamePhase !== 'answering' || gameState.gameWon) return;

    playSound('click', soundEnabled);
    setSelectedOption(index);

    const isCorrect = index === question.correctIndex;

    if (isCorrect) {
      // Mark problem cell as answered immediately so it shows 💧 (survives parent re-renders)
      const cellToMark = pendingProblemCell;
      if (cellToMark) {
        setAnsweredProblemCells((prev) => [...prev, `${cellToMark[0]},${cellToMark[1]}`]);
        setPendingProblemCell(null);
      }
      resetStrikes(); // Correct answer zeros strikes
      // Then close modal after brief feedback
      setTimeout(() => {
        setGamePhase('shooting');
        setSelectedOption(null);
        onAnswer(true); // This triggers general feedback system
      }, 800); // Brief pause to see green button
    } else {
      // Wrong answer in modal: spend a heart (normal behavior)
      setTimeout(() => {
        setSelectedOption(null);
        onAnswer(false);
        // Stay in answering phase until correct
      }, 800);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (gamePhase !== 'shooting' || gameState.gameWon) return;

    const isRevealed = gameState.revealed.some(([r, c]) => r === row && c === col);
    if (isRevealed) return;

    playSound('click', soundEnabled);

    const cellType = gameState.cellGrid[row]?.[col] ?? 'empty';
    const newRevealed: Array<[number, number]> = [
      ...gameState.revealed,
      [row, col] as [number, number],
    ];
    let newHits: Array<[number, number]> = gameState.hits;
    let newSunkShips: string[] = gameState.sunkShips;
    let gameWon: boolean = gameState.gameWon;
    const shipsCopy = JSON.parse(JSON.stringify(gameState.ships)) as typeof gameState.ships;

    if (cellType === 'ship') {
      const result = applyShot(shipsCopy, gameState.revealed, row, col);
      newHits = result.hit ? [...gameState.hits, [row, col] as [number, number]] : gameState.hits;
      newSunkShips = result.sunkShipId
        ? [...gameState.sunkShips, result.sunkShipId]
        : gameState.sunkShips;
      gameWon = checkWinCondition(shipsCopy);
      playSound('success', soundEnabled);
      if (result.sunkShipId) {
        resetStrikes();
        setTimeout(() => playSound('success', soundEnabled), 300);
      }
    } else if (cellType === 'problem') {
      playSound('wrong', soundEnabled);
      setEliminatedIndices([]);
      setPendingProblemCell([row, col]);
      setGamePhase('answering');
    } else if (isWaterCell(cellType)) {
      // Empty, star, or heart: add strike; 5 strikes = spend a heart
      const willBeAtMax = strikes + 1 >= STRIKES_BEFORE_HEART;
      addStrike();
      if (willBeAtMax && spendHeart) {
        spendHeart();
        resetStrikes();
        if (endGame && useGameStore.getState().hearts <= 0) endGame();
      }
      playSound(cellType === 'star' || cellType === 'heart' ? 'success' : 'click', soundEnabled);
    }

    setGameState((prev) => ({
      ...prev,
      ships: shipsCopy,
      revealed: newRevealed,
      hits: newHits,
      sunkShips: newSunkShips,
      gameWon,
    }));

    setProblem({
      ...problem,
      revealed: newRevealed,
      hits: newHits,
      sunkShips: newSunkShips,
      ships: shipsCopy,
      gameWon,
    });

    setSelectedOption(null);

    if (gameWon) {
      setTimeout(() => playSound('success', soundEnabled), 500);
    }
  };

  const renderGrid = () => {
    const { gridSize, cellGrid } = gameState;
    const sunkShipPositions = new Set<string>();
    gameState.ships.forEach((ship) => {
      if (isShipSunk(ship)) {
        ship.positions.forEach(([r, c]) => sunkShipPositions.add(`${r},${c}`));
      }
    });
    const answeredSet = new Set(answeredProblemCells);

    const getRevealedWaterContent = (r: number, c: number) => {
      const type = cellGrid[r]?.[c] ?? 'empty';
      return type === 'problem' && !answeredSet.has(`${r},${c}`)
        ? CELL_EMOJI.problem
        : CELL_EMOJI.water;
    };

    return (
      <div className="flex gap-1">
        <div className="flex flex-col justify-between py-1">
          <div className="h-6 sm:h-7" />
          {Array.from({ length: gridSize }, (_, row) => (
            <div
              key={`row-${row}`}
              className="flex items-center justify-center text-xs sm:text-sm font-bold text-slate-600"
              style={{ height: `calc((100% - 1.75rem) / ${gridSize})` }}
            >
              {row + 1}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <div
            className="grid mb-1"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {COLUMN_LABELS.slice(0, gridSize).map((label) => (
              <div
                key={`col-${label}`}
                className="text-center text-xs sm:text-sm font-bold text-slate-600 h-6 sm:h-7 flex items-center justify-center"
              >
                {label}
              </div>
            ))}
          </div>

          <div
            className="grid gap-2"
            data-testid="battlelearn-grid"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: gridSize }, (_, row) =>
              Array.from({ length: gridSize }, (_, col) => {
                const posKey = `${row},${col}`;
                const isRevealed = gameState.revealed.some(([r, c]) => r === row && c === col);
                const isHit = gameState.hits.some(([r, c]) => r === row && c === col);
                const isSunkShipPosition = sunkShipPositions.has(posKey);

                let cellClass =
                  'w-full h-full border border-gray-300 rounded flex items-center justify-center text-2xl font-bold transition-all duration-200';
                let cellContent = '';

                if (isSunkShipPosition) {
                  cellClass +=
                    ' bg-gradient-to-br from-amber-700 to-red-900 shadow-xl text-white ring-2 ring-amber-400 ring-offset-1';
                  cellContent = CELL_EMOJI.sunk;
                } else if (!isRevealed) {
                  cellClass +=
                    ' bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 shadow-md hover:shadow-xl cursor-pointer transform hover:-translate-y-0.5 transition-all';
                  if (gamePhase === 'shooting' && !gameState.gameWon) cellClass += ' animate-pulse';
                } else if (isHit) {
                  cellClass +=
                    ' bg-gradient-to-br from-orange-400 to-red-500 shadow-lg text-white animate-battlelearn-hit';
                  cellContent = CELL_EMOJI.hit;
                } else {
                  cellClass += ' bg-gradient-to-br from-slate-200 to-slate-300 text-blue-600';
                  cellContent = getRevealedWaterContent(row, col);
                }

                return (
                  <div
                    key={`${row}-${col}`}
                    data-testid={`battlelearn-cell-${row}-${col}`}
                    data-qa-cell-type={
                      import.meta.env.DEV ? (cellGrid[row]?.[col] ?? 'empty') : undefined
                    }
                    className={cellClass}
                    onClick={() => handleCellClick(row, col)}
                    style={{
                      aspectRatio: '1/1',
                      cursor:
                        gamePhase === 'shooting' &&
                        !isSunkShipPosition &&
                        !isRevealed &&
                        !gameState.gameWon
                          ? 'pointer'
                          : 'default',
                    }}
                  >
                    {cellContent}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show victory screen if game is won
  if (gameState.gameWon) {
    return (
      <GameResultScreen
        type="victory"
        onContinue={() => onAnswer(true)}
        customMessage={t.battlelearn.allShipsSunk}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center px-4 py-6 animate-in fade-in duration-300">
      {/* Misses (strikes) – small circles above play area, same as Word Cascade */}
      {!gameState.gameWon && (
        <div
          className="flex items-center gap-1 mb-2"
          aria-label={
            t.battlelearn.strikesAriaLabel?.replace('{count}', String(triesLeft)) ??
            `${triesLeft} water hits before heart`
          }
        >
          {Array.from({ length: STRIKES_BEFORE_HEART }).map((_, i) => (
            <span
              key={i}
              className={[
                'w-3 h-3 rounded-full border border-red-200 transition-colors',
                i < strikes ? 'bg-red-500' : 'bg-white',
              ].join(' ')}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
      {/* Grid - Main play area */}
      <div className="w-full max-w-2xl">
        <div className="shadow-lg rounded-lg p-3 sm:p-4 bg-gradient-to-br from-slate-100 to-slate-200">
          {renderGrid()}
        </div>
      </div>

      {/* Problem Modal - Only shown when answering */}
      <GameProblemModal
        isOpen={gamePhase === 'answering' && !gameState.gameWon}
        title={t.battlelearn.answerToContinue}
        prompt={question.prompt}
        options={question.options}
        correctIndex={question.correctIndex}
        selectedOption={selectedOption}
        onOptionSelect={handleOptionSelect}
        disabled={selectedOption !== null}
        eliminatedIndices={eliminatedIndices}
        icon={<Target className="text-orange-600" />}
      />
      {/* Same hint area as other games: shooting = grid hints, answering = eliminate only */}
      {paidHints.length > 0 && (
        <PaidHintButtons
          hints={
            gamePhase === 'shooting'
              ? paidHints.filter((h) => h.id !== 'eliminate')
              : paidHints.filter((h) => h.id === 'eliminate')
          }
          stars={stars}
          onHintClick={handlePaidHint}
          disabled={
            gameState.gameWon ||
            (gamePhase === 'answering' &&
              (selectedOption !== null || eliminatedIndices.length >= question.options.length - 1))
          }
        />
      )}
    </div>
  );
};
