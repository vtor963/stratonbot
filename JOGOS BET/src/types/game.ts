export type SymbolState = 'idle' | 'spinning' | 'stopping' | 'winning';

export interface SymbolData {
  id: string;
  state: SymbolState;
  isMultiplier?: boolean;
  multiplierValue?: number;
}

export interface GridPosition {
  col: number;
  row: number;
}

export interface SpinResult {
  grid: SymbolData[][];
  winningPositions: GridPosition[];
  multiplierPositions: GridPosition[];
  totalWin: number;
  isFreeSpin: boolean;
  freeSpinsRemaining?: number;
}

export interface ReelState {
  symbols: SymbolData[];
  isSpinning: boolean;
  stopDelay: number;
}

export interface GameState {
  grid: SymbolData[][];
  isSpinning: boolean;
  reelsStopping: boolean[];
  currentSpin: number;
  lastWin: number;
  balance: number;
  betAmount: number;
  freeSpins: number;
  globalMultiplier: number;
}