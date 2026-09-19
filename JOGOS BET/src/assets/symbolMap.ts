export const SYMBOL_ASSET_MAP: Record<string, string> = {
  sym_crown: '/assets/symbols/sym_crown.png',
  sym_hourglass: '/assets/symbols/sym_hourglass.png',
  sym_ring: '/assets/symbols/sym_ring.png',
  sym_chalice: '/assets/symbols/sym_chalice.png',
  sym_gem_red: '/assets/symbols/sym_gem_red.png',
  sym_gem_purple: '/assets/symbols/sym_gem_purple.png',
  sym_gem_yellow: '/assets/symbols/sym_gem_yellow.png',
  sym_gem_green: '/assets/symbols/sym_gem_green.png',
  sym_gem_blue: '/assets/symbols/sym_gem_blue.png',
  sym_scatter: '/assets/symbols/sym_scatter.png',
  sym_mult_green: '/assets/symbols/sym_mult_green.png',
  sym_mult_blue: '/assets/symbols/sym_mult_blue.png',
  sym_mult_purple: '/assets/symbols/sym_mult_purple.png',
  sym_mult_red: '/assets/symbols/sym_mult_red.png',
};

export const SYMBOL_STATES = {
  idle: 'idle',
  spinning: 'spinning',
  stopping: 'stopping',
  winning: 'winning',
} as const;

export type SymbolState = typeof SYMBOL_STATES[keyof typeof SYMBOL_STATES];

export function getSymbolAsset(symbolId: string): string {
  return SYMBOL_ASSET_MAP[symbolId] || '/assets/symbols/placeholder.png';
}