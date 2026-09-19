import { GameConfig, TargetMatrix, ReelStripSymbol } from './config';
import { injectThemeVariables, getSymbolAsset } from '../styles/variables';

export interface SlotEngineOptions {
  container: HTMLElement;
  config: GameConfig;
  onSpinComplete?: (result: TargetMatrix) => void;
  onWinAnimationComplete?: () => void;
}

export class SlotEngine {
  private container: HTMLElement;
  private config: GameConfig;
  private reels: HTMLElement[] = [];
  private reelStrips: ReelStripSymbol[][] = [];
  private isSpinning = false;
  private onSpinComplete?: (result: TargetMatrix) => void;
  private onWinAnimationComplete?: () => void;
  private symbolSize = 120;
  private visibleRows = 3;
  private bufferRows = 3;
  private spinDuration = 1200;
  private stopStagger = 150;
  private easing = 'cubic-bezier(0.23, 1, 0.32, 1)';

  constructor(options: SlotEngineOptions) {
    this.container = options.container;
    this.config = options.config;
    this.onSpinComplete = options.onSpinComplete;
    this.onWinAnimationComplete = options.onWinAnimationComplete;
    
    this.injectTheme();
    this.buildUI();
  }

  private injectTheme(): void {
    injectThemeVariables(this.config.theme.colors);
    
    const root = document.documentElement;
    root.style.setProperty('--symbol-size', `${this.symbolSize}px`);
    root.style.setProperty('--visible-rows', `${this.visibleRows}`);
    root.style.setProperty('--buffer-rows', `${this.bufferRows}`);
    root.style.setProperty('--spin-duration', `${this.spinDuration}ms`);
    root.style.setProperty('--stop-stagger', `${this.stopStagger}ms`);
    root.style.setProperty('--easing', this.easing);
  }

  private buildUI(): void {
    this.container.innerHTML = '';
    this.container.className = 'slot-engine-container';
    
    const { columns, rows } = this.config.gameMetadata.grid;
    this.visibleRows = rows;
    
    const grid = document.createElement('div');
    grid.className = 'slot-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${columns}, var(--symbol-size));
      gap: 4px;
      background: var(--bg-grid);
      padding: 8px;
      border-radius: 12px;
      border: 2px solid var(--primary-neon);
      box-shadow: 
        0 0 20px rgba(var(--primary-neon-rgb), 0.3),
        inset 0 0 40px rgba(0, 0, 0, 0.5);
    `;

    for (let col = 0; col < columns; col++) {
      const reel = document.createElement('div');
      reel.className = 'slot-reel';
      reel.style.cssText = `
        position: relative;
        width: var(--symbol-size);
        height: calc(var(--symbol-size) * var(--visible-rows));
        overflow: hidden;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.3);
      `;
      
      const strip = document.createElement('div');
      strip.className = 'reel-strip';
      strip.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        will-change: transform;
        transition: transform var(--spin-duration) var(--easing);
      `;
      
      reel.appendChild(strip);
      grid.appendChild(reel);
      this.reels.push(reel);
    }
    
    this.container.appendChild(grid);
    this.initializeReelStrips();
  }

  private initializeReelStrips(): void {
    const { columns, rows } = this.config.gameMetadata.grid;
    const allSymbols = this.config.symbols.map(s => s.id);
    
    this.reelStrips = [];
    for (let col = 0; col < columns; col++) {
      const strip: ReelStripSymbol[] = [];
      const totalSymbols = rows + this.bufferRows * 2;
      
      for (let i = 0; i < totalSymbols; i++) {
        const symbolId = allSymbols[Math.floor(Math.random() * allSymbols.length)];
        strip.push({ symbolId, state: 'idle' });
      }
      this.reelStrips.push(strip);
    }
    
    this.renderReelStrips();
  }

  private renderReelStrips(): void {
    this.reels.forEach((reel, colIndex) => {
      const strip = reel.querySelector('.reel-strip') as HTMLElement;
      if (!strip) return;
      
      strip.innerHTML = '';
      this.reelStrips[colIndex].forEach((item) => {
        const symbolEl = document.createElement('div');
        symbolEl.className = 'reel-symbol';
        symbolEl.style.cssText = `
          width: var(--symbol-size);
          height: var(--symbol-size);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        const img = document.createElement('img');
        img.src = getSymbolAsset(this.config.symbols, item.symbolId, item.state);
        img.alt = item.symbolId;
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
          transition: filter 0.1s ease;
        `;
        
        if (item.state === 'spin') {
          img.style.filter = 'blur(4px)';
        }
        
        symbolEl.appendChild(img);
        strip.appendChild(symbolEl);
      });
    });
  }

  public updateConfig(config: GameConfig): void {
    this.config = config;
    this.injectTheme();
    this.initializeReelStrips();
  }

  public async spinToResult(targetMatrix: TargetMatrix): Promise<void> {
    if (this.isSpinning) return;
    this.isSpinning = true;

    this.prepareReelStripsForResult(targetMatrix);
    this.setAllReelsState('spin');
    this.renderReelStrips();

    await this.animateSpin(targetMatrix);
    
    this.isSpinning = false;
    this.onSpinComplete?.(targetMatrix);
  }

  private prepareReelStripsForResult(targetMatrix: TargetMatrix): void {
    const { columns, rows } = this.config.gameMetadata.grid;
    const allSymbols = this.config.symbols.map(s => s.id);
    
    for (let col = 0; col < columns; col++) {
      const newStrip: ReelStripSymbol[] = [];
      
      for (let i = 0; i < this.bufferRows; i++) {
        const symbolId = allSymbols[Math.floor(Math.random() * allSymbols.length)];
        newStrip.push({ symbolId, state: 'idle' });
      }
      
      for (let row = rows - 1; row >= 0; row--) {
        newStrip.push({ symbolId: targetMatrix[col][row], state: 'spin' });
      }
      
      for (let i = 0; i < this.bufferRows; i++) {
        const symbolId = allSymbols[Math.floor(Math.random() * allSymbols.length)];
        newStrip.push({ symbolId, state: 'idle' });
      }
      
      this.reelStrips[col] = newStrip;
    }
  }

  private setAllReelsState(state: 'idle' | 'spin' | 'win'): void {
    this.reelStrips.forEach(strip => {
      strip.forEach(item => {
        item.state = state;
      });
    });
  }

  private async animateSpin(targetMatrix: TargetMatrix): Promise<void> {
    const stripHeight = this.symbolSize;
    const bufferHeight = this.bufferRows * stripHeight;
    const targetOffset = -bufferHeight;
    
    const spinPromises = this.reels.map((reel, colIndex) => {
      return new Promise<void>((resolve) => {
        const strip = reel.querySelector('.reel-strip') as HTMLElement;
        if (!strip) { resolve(); return; }
        
        const delay = colIndex * this.stopStagger;
        
        setTimeout(() => {
          strip.style.transition = `transform ${this.spinDuration}ms ${this.easing}`;
          strip.style.transform = `translateY(${targetOffset}px)`;
          
          const handleTransitionEnd = () => {
            strip.removeEventListener('transitionend', handleTransitionEnd);
            this.snapReelToFinal(colIndex);
            resolve();
          };
          
          strip.addEventListener('transitionend', handleTransitionEnd);
        }, delay);
      });
    });
    
    await Promise.all(spinPromises);
    this.setAllReelsState('idle');
    this.renderReelStrips();
    this.triggerWinAnimations(targetMatrix);
  }

  private snapReelToFinal(colIndex: number): void {
    const reel = this.reels[colIndex];
    const strip = reel.querySelector('.reel-strip') as HTMLElement;
    
    if (!strip) return;
    
    strip.style.transition = 'none';
    strip.style.transform = `translateY(${-this.bufferRows * this.symbolSize}px)`;
  }

  private triggerWinAnimations(targetMatrix: TargetMatrix): void {
    const { columns, rows } = this.config.gameMetadata.grid;
    const symbolCounts = new Map<string, number>();
    
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const id = targetMatrix[col][row];
        symbolCounts.set(id, (symbolCounts.get(id) || 0) + 1);
      }
    }
    
    let hasWin = false;
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const id = targetMatrix[col][row];
        if (symbolCounts.get(id) && symbolCounts.get(id)! >= 3) {
          this.animateSymbolWin(col, row);
          hasWin = true;
        }
      }
    }
    
    if (hasWin && this.onWinAnimationComplete) {
      setTimeout(() => this.onWinAnimationComplete!, 1500);
    }
  }

  private animateSymbolWin(col: number, row: number): void {
    const reel = this.reels[col];
    const strip = reel.querySelector('.reel-strip') as HTMLElement;
    if (!strip) return;
    
    const symbolIndex = this.bufferRows + (this.visibleRows - 1 - row);
    const symbolEl = strip.children[symbolIndex] as HTMLElement;
    if (!symbolEl) return;
    
    const img = symbolEl.querySelector('img') as HTMLImageElement;
    if (!img) return;
    
    const symbolId = this.reelStrips[col][symbolIndex].symbolId;
    img.src = getSymbolAsset(this.config.symbols, symbolId, 'win');
    img.style.filter = 'none';
    symbolEl.style.animation = 'win-pulse 1s ease-in-out 3';
    
    symbolEl.style.zIndex = '10';
    symbolEl.style.transform = 'scale(1.1)';
    symbolEl.style.filter = 'drop-shadow(0 0 10px var(--win-color)) drop-shadow(0 0 20px var(--win-color))';
  }

  public destroy(): void {
    this.container.innerHTML = '';
    this.reels = [];
    this.reelStrips = [];
  }
}

export function createSlotEngine(options: SlotEngineOptions): SlotEngine {
  return new SlotEngine(options);
}