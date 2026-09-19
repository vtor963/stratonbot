export interface SymbolAsset {
  idle: string;
  spin: string;
  win: string;
}

export interface SymbolConfig {
  id: string;
  assets: SymbolAsset;
}

export interface ThemeColors {
  backgroundMain: string;
  backgroundGrid: string;
  primaryNeon: string;
  winHighlight: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
}

export interface GridConfig {
  columns: number;
  rows: number;
}

export interface GameMetadata {
  gameId: string;
  grid: GridConfig;
}

export interface GameConfig {
  gameMetadata: GameMetadata;
  theme: ThemeConfig;
  symbols: SymbolConfig[];
}

export interface MatrixPosition {
  col: number;
  row: number;
  symbolId: string;
}

export type TargetMatrix = string[][];

export interface SpinResult {
  targetMatrix: TargetMatrix;
  winningLines?: WinningLine[];
}

export interface WinningLine {
  positions: MatrixPosition[];
  symbolId: string;
  multiplier: number;
}

export interface ReelStripSymbol {
  symbolId: string;
  state: 'idle' | 'spin' | 'win';
}

export const DEFAULT_CONFIG: GameConfig = {
  gameMetadata: {
    gameId: 'slot_base_01',
    grid: { columns: 3, rows: 3 }
  },
  theme: {
    colors: {
      backgroundMain: '#0B0C10',
      backgroundGrid: '#1F2833',
      primaryNeon: '#00FFCC',
      winHighlight: '#FF007F'
    }
  },
  symbols: [
    {
      id: 'SYM_WILD',
      assets: {
        idle: 'https://via.placeholder.com/120x120/00FFCC/000000?text=WILD',
        spin: 'https://via.placeholder.com/120x120/00FFCC/000000?text=WILD_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=WILD_WIN'
      }
    },
    {
      id: 'SYM_LOW_1',
      assets: {
        idle: 'https://via.placeholder.com/120x120/45A29E/FFFFFF?text=CHIP',
        spin: 'https://via.placeholder.com/120x120/45A29E/FFFFFF?text=CHIP_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=CHIP_WIN'
      }
    },
    {
      id: 'SYM_LOW_2',
      assets: {
        idle: 'https://via.placeholder.com/120x120/8A2BE2/FFFFFF?text=GEM',
        spin: 'https://via.placeholder.com/120x120/8A2BE2/FFFFFF?text=GEM_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=GEM_WIN'
      }
    },
    {
      id: 'SYM_LOW_3',
      assets: {
        idle: 'https://via.placeholder.com/120x120/FFD700/000000?text=COIN',
        spin: 'https://via.placeholder.com/120x120/FFD700/000000?text=COIN_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=COIN_WIN'
      }
    }
  ]
};