'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Symbol } from './Symbol';
import { SymbolData, GridPosition, GameState, SymbolState } from '@/types/game';

const ROWS = 5;
const COLS = 6;
const SYMBOLS = [
  'sym_crown',
  'sym_hourglass',
  'sym_ring',
  'sym_chalice',
  'sym_gem_red',
  'sym_gem_purple',
  'sym_gem_yellow',
  'sym_gem_green',
  'sym_gem_blue',
  'sym_scatter',
];

const MULTIPLIER_SYMBOLS = [
  'sym_mult_green',
  'sym_mult_blue',
  'sym_mult_purple',
  'sym_mult_red',
];

const MULTIPLIER_VALUES = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100, 250, 500];

function getRandomSymbol(): string {
  const roll = Math.random();
  if (roll < 0.02) {
    return MULTIPLIER_SYMBOLS[Math.floor(Math.random() * MULTIPLIER_SYMBOLS.length)];
  }
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function getRandomMultiplierValue(): number {
  return MULTIPLIER_VALUES[Math.floor(Math.random() * MULTIPLIER_VALUES.length)];
}

function createInitialGrid(): SymbolData[][] {
  const grid: SymbolData[][] = [];
  for (let col = 0; col < COLS; col++) {
    grid[col] = [];
    for (let row = 0; row < ROWS; row++) {
      const symbolId = getRandomSymbol();
      const isMultiplier = symbolId.startsWith('sym_mult_');
      grid[col][row] = {
        id: symbolId,
        state: 'idle',
        isMultiplier,
        multiplierValue: isMultiplier ? getRandomMultiplierValue() : undefined,
      };
    }
  }
  return grid;
}

function createSpinningGrid(): SymbolData[][] {
  const grid: SymbolData[][] = [];
  for (let col = 0; col < COLS; col++) {
    grid[col] = [];
    for (let row = 0; row < ROWS; row++) {
      const symbolId = getRandomSymbol();
      const isMultiplier = symbolId.startsWith('sym_mult_');
      grid[col][row] = {
        id: symbolId,
        state: 'spinning',
        isMultiplier,
        multiplierValue: isMultiplier ? getRandomMultiplierValue() : undefined,
      };
    }
  }
  return grid;
}

function createFinalGrid(): SymbolData[][] {
  const grid: SymbolData[][] = [];
  for (let col = 0; col < COLS; col++) {
    grid[col] = [];
    for (let row = 0; row < ROWS; row++) {
      const symbolId = getRandomSymbol();
      const isMultiplier = symbolId.startsWith('sym_mult_');
      grid[col][row] = {
        id: symbolId,
        state: 'idle',
        isMultiplier,
        multiplierValue: isMultiplier ? getRandomMultiplierValue() : undefined,
      };
    }
  }
  return grid;
}

function findWinningClusters(grid: SymbolData[][]): GridPosition[] {
  const counts: Record<string, number> = {};
  const positions: Record<string, GridPosition[]> = {};

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const symbol = grid[col][row];
      if (!symbol.isMultiplier) {
        counts[symbol.id] = (counts[symbol.id] || 0) + 1;
        if (!positions[symbol.id]) positions[symbol.id] = [];
        positions[symbol.id].push({ col, row });
      }
    }
  }

  const winningPositions: GridPosition[] = [];
  for (const [symbolId, count] of Object.entries(counts)) {
    if (count >= 8) {
      winningPositions.push(...(positions[symbolId] || []));
    }
  }
  return winningPositions;
}

function findMultiplierPositions(grid: SymbolData[][]): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if (grid[col][row].isMultiplier) {
        positions.push({ col, row });
      }
    }
  }
  return positions;
}

export function SlotGame() {
  const [gameState, setGameState] = useState<GameState>({
    grid: createInitialGrid(),
    isSpinning: false,
    reelsStopping: Array(COLS).fill(false),
    currentSpin: 0,
    lastWin: 0,
    balance: 10000,
    betAmount: 100,
    freeSpins: 0,
    globalMultiplier: 1,
  });

  const spinTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    [...spinTimeoutsRef.current, ...stopTimeoutsRef.current].forEach(clearTimeout);
    spinTimeoutsRef.current = [];
    stopTimeoutsRef.current = [];
  }, []);

  const handleSpin = useCallback(() => {
    if (gameState.isSpinning || gameState.balance < gameState.betAmount) return;

    clearAllTimeouts();

    setGameState(prev => ({
      ...prev,
      isSpinning: true,
      balance: prev.balance - prev.betAmount,
      lastWin: 0,
      grid: createSpinningGrid(),
      reelsStopping: Array(COLS).fill(false),
    }));

    const spinDuration = 2000 + Math.random() * 1000;

    const spinTimeout = setTimeout(() => {
      setGameState(prev => {
        const finalGrid = createFinalGrid();
        const winningPositions = findWinningClusters(finalGrid);
        const multiplierPositions = findMultiplierPositions(finalGrid);

        let totalMultiplier = 1;
        multiplierPositions.forEach(pos => {
          const mult = finalGrid[pos.col][pos.row].multiplierValue || 1;
          totalMultiplier *= mult;
        });

        const isFreeSpin = prev.freeSpins > 0;
        let globalMult = prev.globalMultiplier;
        if (isFreeSpin && totalMultiplier > 1) {
          globalMult *= totalMultiplier;
        }

        let winAmount = 0;
        if (winningPositions.length > 0) {
          const symbolCounts: Record<string, number> = {};
          winningPositions.forEach(pos => {
            const sym = finalGrid[pos.col][pos.row];
            symbolCounts[sym.id] = (symbolCounts[sym.id] || 0) + 1;
          });

          Object.entries(symbolCounts).forEach(([symbolId, count]) => {
            let mult = 0;
            if (count >= 12) mult = 50;
            else if (count >= 10) mult = 25;
            else if (count >= 8) mult = 10;
            if (symbolId === 'sym_hourglass') { if (count >= 12) mult = 25; else if (count >= 10) mult = 10; else mult = 2.5; }
            if (symbolId === 'sym_ring') { if (count >= 12) mult = 15; else if (count >= 10) mult = 5; else mult = 2; }
            if (symbolId === 'sym_chalice') { if (count >= 12) mult = 12; else if (count >= 10) mult = 2; else mult = 1.5; }
            if (symbolId === 'sym_gem_red') { if (count >= 12) mult = 10; else if (count >= 10) mult = 1.5; else mult = 1; }
            if (symbolId === 'sym_gem_purple') { if (count >= 12) mult = 8; else if (count >= 10) mult = 1.2; else mult = 0.8; }
            if (symbolId === 'sym_gem_yellow') { if (count >= 12) mult = 5; else if (count >= 10) mult = 1; else mult = 0.5; }
            if (symbolId === 'sym_gem_green') { if (count >= 12) mult = 4; else if (count >= 10) mult = 0.9; else mult = 0.4; }
            if (symbolId === 'sym_gem_blue') { if (count >= 12) mult = 2; else if (count >= 10) mult = 0.75; else mult = 0.25; }

            winAmount += mult * prev.betAmount;
          });
        }

        winAmount *= totalMultiplier;

        const scatterCount = finalGrid.flat().filter(s => s.id === 'sym_scatter').length;
        let freeSpinsAwarded = 0;
        if (scatterCount >= 4) {
          freeSpinsAwarded = 15;
        } else if (scatterCount >= 3 && prev.freeSpins > 0) {
          freeSpinsAwarded = 5;
        }

        const markedGrid: SymbolData[][] = finalGrid.map((col, colIndex) => col.map((symbol, rowIdx) => {
          const isWinning = winningPositions.some(p => p.col === colIndex && p.row === rowIdx);
          const newState: SymbolState = isWinning ? 'winning' : 'idle';
          return {
            ...symbol,
            state: newState,
          };
        }));

        return {
          ...prev,
          isSpinning: false,
          grid: markedGrid,
          lastWin: winAmount,
          balance: prev.balance + winAmount,
          freeSpins: prev.freeSpins + freeSpinsAwarded - (isFreeSpin ? 1 : 0),
          globalMultiplier: globalMult,
          currentSpin: prev.currentSpin + 1,
        };
      });

      stopTimeoutsRef.current = [];
      for (let col = 0; col < COLS; col++) {
        const delay = col * 200;
        const timeout = setTimeout(() => {
          setGameState(prev => {
            const newReelsStopping = [...prev.reelsStopping];
            newReelsStopping[col] = true;
            return { ...prev, reelsStopping: newReelsStopping };
          });

          setTimeout(() => {
            setGameState(prev => {
              const newReelsStopping = [...prev.reelsStopping];
              newReelsStopping[col] = false;
              return { ...prev, reelsStopping: newReelsStopping };
            });
          }, 450);
        }, delay);
        stopTimeoutsRef.current.push(timeout);
      }
    }, spinDuration);

    spinTimeoutsRef.current.push(spinTimeout);
  }, [gameState.isSpinning, gameState.balance, gameState.betAmount, clearAllTimeouts]);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  const { grid, isSpinning, reelsStopping, lastWin, balance, betAmount, freeSpins, globalMultiplier } = gameState;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 panel p-4 sm:p-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Gates of Olympus
            </h1>
            <p className="text-xs text-white/50 mt-1">Dark Olympus Edition</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-center sm:text-left">
            <div className="panel px-4 py-2 rounded-xl">
              <p className="text-xs text-white/60 uppercase tracking-wide">Saldo</p>
              <p className="text-xl font-bold text-yellow-400">{balance.toLocaleString()}</p>
            </div>
            <div className="panel px-4 py-2 rounded-xl">
              <p className="text-xs text-white/60 uppercase tracking-wide">Aposta</p>
              <p className="text-xl font-bold">{betAmount.toLocaleString()}</p>
            </div>
            {freeSpins > 0 && (
              <div className="panel px-4 py-2 rounded-xl border-cyan-500/30">
                <p className="text-xs text-cyan-400 uppercase tracking-wide">Free Spins</p>
                <p className="text-xl font-bold text-cyan-400">{freeSpins}</p>
              </div>
            )}
            {globalMultiplier > 1 && (
              <div className="panel px-4 py-2 rounded-xl border-purple-500/30">
                <p className="text-xs text-purple-400 uppercase tracking-wide">Multiplicador Global</p>
                <p className="text-xl font-bold text-purple-400">{globalMultiplier}x</p>
              </div>
            )}
          </div>
        </header>

        <main className="panel p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-yellow-500/5 to-transparent pointer-events-none" />

          <div className="relative grid grid-cols-6 gap-2 sm:gap-3 max-w-full mx-auto">
            {grid.map((column, colIndex) => (
              <div
                key={colIndex}
                className="slot-reel relative flex flex-col-reverse items-center"
                style={{ perspective: '1000px' }}
              >
                {column.map((symbol, rowIndex) => (
                  <Symbol
                    key={`${colIndex}-${rowIndex}`}
                    data={symbol}
                    size={64}
                  />
                ))}
                {(isSpinning || reelsStopping[colIndex]) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent pointer-events-none z-10" />
                )}
              </div>
            ))}
          </div>

          {lastWin > 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-center animate-win-flash pointer-events-none">
              <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
                BIG WIN
              </div>
              <div className="text-2xl sm:text-4xl font-bold text-yellow-300 mt-2">
                {lastWin.toLocaleString()}
              </div>
            </div>
          )}
        </main>

        <button
          onClick={handleSpin}
          disabled={isSpinning || balance < betAmount}
          className="spin-button w-full sm:w-auto mx-auto block px-12 py-4 sm:px-16"
          aria-label="Girar"
        >
          {isSpinning ? 'GIRANDO...' : 'GIRAR'}
        </button>

        {lastWin > 0 && !isSpinning && (
          <div className="panel p-4 text-center animate-win-flash">
            <p className="text-lg font-bold text-yellow-300">Ganho Total: <span className="text-2xl">{lastWin.toLocaleString()}</span></p>
          </div>
        )}

        <footer className="panel p-4 text-center text-xs text-white/50">
          <p>RTP Teórico: 96.5% | Volatilidade: Alta | Max Win: 5000x</p>
        </footer>
      </div>
    </div>
  );
}