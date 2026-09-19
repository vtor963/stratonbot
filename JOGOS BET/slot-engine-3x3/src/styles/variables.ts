import { ThemeColors } from '../core/config';

export function injectThemeVariables(colors: ThemeColors): void {
  const root = document.documentElement;
  root.style.setProperty('--bg-main', colors.backgroundMain);
  root.style.setProperty('--bg-grid', colors.backgroundGrid);
  root.style.setProperty('--primary-neon', colors.primaryNeon);
  root.style.setProperty('--win-color', colors.winHighlight);
  
  const neonRgb = hexToRgb(colors.primaryNeon);
  const winRgb = hexToRgb(colors.winHighlight);
  
  if (neonRgb) {
    root.style.setProperty('--primary-neon-rgb', `${neonRgb.r}, ${neonRgb.g}, ${neonRgb.b}`);
  }
  if (winRgb) {
    root.style.setProperty('--win-color-rgb', `${winRgb.r}, ${winRgb.g}, ${winRgb.b}`);
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  if (isNaN(bigint)) return null;
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

export function getSymbolAsset(symbols: { id: string; assets: { idle: string; spin: string; win: string } }[], symbolId: string, state: 'idle' | 'spin' | 'win'): string {
  const symbol = symbols.find(s => s.id === symbolId);
  return symbol?.assets[state] || symbol?.assets.idle || '';
}