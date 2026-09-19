export interface GameConfig {
  gameId: string;
  gameName: string;
  provider: string;
  version: string;
  metrics: GameMetrics;
  grid: GridConfig;
  mechanics: MechanicsConfig;
  paytable: PaytableEntry[];
  features: FeaturesConfig;
}

export interface GameMetrics {
  targetRtp: number;
  volatility: 'low' | 'medium' | 'high';
  maxWinMultiplier: number;
}

export interface GridConfig {
  columns: number;
  rows: number;
  totalPositions: number;
}

export interface MechanicsConfig {
  type: 'scatter_pays';
  tumbleEnabled: boolean;
  minClusterSize: number;
}

export interface PaytableEntry {
  id: string;
  pays: Record<string, number>;
  weight: number;
}

export interface FeaturesConfig {
  scatter: ScatterConfig;
  multipliers: MultiplierConfig;
}

export interface ScatterConfig {
  id: string;
  payouts: Record<string, number>;
  weight: number;
  triggers: {
    freeSpins: FreeSpinsTrigger;
  };
}

export interface FreeSpinsTrigger {
  minCount: number;
  spinsAwarded: number;
  retriggerCount: number;
  retriggerSpins: number;
}

export interface MultiplierConfig {
  enabled: boolean;
  symbols: string[];
  values: number[];
  baseGameChancePct: number;
  freeSpinsChancePct: number;
  freeSpinsLogic: {
    accumulateGlobalMultiplier: boolean;
    applyOnWinOnly: boolean;
  };
}

export interface SymbolAsset {
  id: string;
  category: 'high_pay' | 'low_pay' | 'scatter' | 'multiplier';
  description: string;
  states: ('_normal' | '_blur' | '_win')[];
}

export const SYMBOL_ASSETS: SymbolAsset[] = [
  { id: 'sym_crown', category: 'high_pay', description: 'Coroa de Ouro de Zeus', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_hourglass', category: 'high_pay', description: 'Ampulheta com areia dourada', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_ring', category: 'high_pay', description: 'Anel com pedra rubi', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_chalice', category: 'high_pay', description: 'Cálice de vinho brilhante', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_gem_red', category: 'low_pay', description: 'Gema vermelha pentagonal', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_gem_purple', category: 'low_pay', description: 'Gema roxa triangular', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_gem_yellow', category: 'low_pay', description: 'Gema amarela hexagonal', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_gem_green', category: 'low_pay', description: 'Gema verde losango', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_gem_blue', category: 'low_pay', description: 'Gema azul quadrada', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_scatter', category: 'scatter', description: 'Rosto de Zeus (animado)', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_mult_green', category: 'multiplier', description: 'Orbe verde com asas', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_mult_blue', category: 'multiplier', description: 'Orbe azul com asas', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_mult_purple', category: 'multiplier', description: 'Orbe roxo com asas', states: ['_normal', '_blur', '_win'] },
  { id: 'sym_mult_red', category: 'multiplier', description: 'Orbe vermelho com asas', states: ['_normal', '_blur', '_win'] },
];

export const THEME_COLORS = {
  background: '#0B0C10',
  panel: '#1F2833',
  gold: '#FFD700',
  cyan: '#45A29E',
  neonBlue: '#66FCF1',
  electricPurple: '#8A2BE2',
  crimson: '#DC143C',
} as const;

export const MULTIPLIER_VALUES = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100, 250, 500] as const;
export type MultiplierValue = typeof MULTIPLIER_VALUES[number];