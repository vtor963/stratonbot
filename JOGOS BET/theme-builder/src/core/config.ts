export interface SymbolAsset {
  idle: string;
  spin: string;
  win: string;
  [key: string]: string;
}

export interface SymbolConfig {
  id: string;
  name: string;
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

export interface TargetMatrix {
  [col: number]: string[];
}

export interface ReelStripSymbol {
  symbolId: string;
  state: 'idle' | 'spin' | 'win';
}

export interface MatrixPosition {
  col: number;
  row: number;
  symbolId: string;
}

export interface WinningLine {
  positions: MatrixPosition[];
  symbolId: string;
  multiplier: number;
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
      name: 'Wild (Dragão Dourado)',
      assets: {
        idle: 'https://via.placeholder.com/120x120/FFD700/000000?text=DRAGÃO',
        spin: 'https://via.placeholder.com/120x120/FFD700/000000?text=DRAGÃO_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=DRAGÃO_WIN'
      }
    },
    {
      id: 'SYM_HIGH_1',
      name: 'Alto 1 (Olho do Dragão)',
      assets: {
        idle: 'https://via.placeholder.com/120x120/FF4444/FFFFFF?text=OLHO',
        spin: 'https://via.placeholder.com/120x120/FF4444/FFFFFF?text=OLHO_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=OLHO_WIN'
      }
    },
    {
      id: 'SYM_HIGH_2',
      name: 'Alto 2 (Escama)',
      assets: {
        idle: 'https://via.placeholder.com/120x120/00CC88/FFFFFF?text=ESCAMA',
        spin: 'https://via.placeholder.com/120x120/00CC88/FFFFFF?text=ESCAMA_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=ESCAMA_WIN'
      }
    },
    {
      id: 'SYM_LOW_1',
      name: 'Baixo 1 (Moeda)',
      assets: {
        idle: 'https://via.placeholder.com/120x120/FFD700/000000?text=MOEDA',
        spin: 'https://via.placeholder.com/120x120/FFD700/000000?text=MOEDA_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=MOEDA_WIN'
      }
    },
    {
      id: 'SYM_LOW_2',
      name: 'Baixo 2 (Gema)',
      assets: {
        idle: 'https://via.placeholder.com/120x120/8844FF/FFFFFF?text=GEMA',
        spin: 'https://via.placeholder.com/120x120/8844FF/FFFFFF?text=GEMA_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=GEMA_WIN'
      }
    },
    {
      id: 'SYM_LOW_3',
      name: 'Baixo 3 (Runas)',
      assets: {
        idle: 'https://via.placeholder.com/120x120/FF8800/FFFFFF?text=RUNA',
        spin: 'https://via.placeholder.com/120x120/FF8800/FFFFFF?text=RUNA_BLUR',
        win: 'https://via.placeholder.com/120x120/FF007F/FFFFFF?text=RUNA_WIN'
      }
    }
  ]
};

export function createEmptySymbol(id: string, name: string): SymbolConfig {
  return {
    id,
    name,
    assets: {
      idle: '',
      spin: '',
      win: ''
    }
  };
}

export function validateConfig(config: GameConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.gameMetadata?.gameId) errors.push('gameId é obrigatório');
  if (!config.gameMetadata?.grid?.columns || !config.gameMetadata?.grid?.rows) {
    errors.push('Grid inválido');
  }
  if (!config.theme?.colors) errors.push('Tema de cores obrigatório');
  if (!config.symbols || config.symbols.length === 0) errors.push('Pelo menos 1 símbolo necessário');
  
  config.symbols?.forEach((sym, i) => {
    if (!sym.id) errors.push(`Símbolo ${i}: id obrigatório`);
    if (!sym.assets?.idle) errors.push(`${sym.id}: asset idle obrigatório`);
    if (!sym.assets?.spin) errors.push(`${sym.id}: asset spin obrigatório`);
    if (!sym.assets?.win) errors.push(`${sym.id}: asset win obrigatório`);
  });
  
  return { valid: errors.length === 0, errors };
}

export function configToJSON(config: GameConfig): string {
  return JSON.stringify(config, null, 2);
}

export function parseConfigJSON(json: string): GameConfig | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function generateGameId(): string {
  return `slot_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
}