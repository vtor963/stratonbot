import { SymbolConfig } from './config';

export interface PreloadedAssets {
  [symbolId: string]: {
    idle: HTMLImageElement;
    spin: HTMLImageElement;
    win: HTMLImageElement;
  };
}

export async function preloadAssets(symbols: SymbolConfig[]): Promise<PreloadedAssets> {
  const assets: PreloadedAssets = {};
  
  const loadPromises = symbols.map(async (symbol) => {
    const [idleImg, spinImg, winImg] = await Promise.all([
      loadImage(symbol.assets.idle),
      loadImage(symbol.assets.spin),
      loadImage(symbol.assets.win)
    ]);
    
    assets[symbol.id] = { idle: idleImg, spin: spinImg, win: winImg };
  });
  
  await Promise.all(loadPromises);
  return assets;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export function createAssetMap(assets: PreloadedAssets): Map<string, { idle: string; spin: string; win: string }> {
  const map = new Map();
  for (const [symbolId, states] of Object.entries(assets)) {
    map.set(symbolId, {
      idle: states.idle.src,
      spin: states.spin.src,
      win: states.win.src
    });
  }
  return map;
}