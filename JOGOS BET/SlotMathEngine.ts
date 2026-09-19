import { GameConfig, PaytableEntry, GridConfig, MechanicsConfig, FeaturesConfig, MultiplierConfig, ScatterConfig } from './game-types';

export interface SpinResult {
  spinHistory: SpinStep[];
  totalWin: number;
  totalMultiplier: number;
  freeSpinsTriggered: boolean;
  freeSpinsAwarded: number;
  scatterCount: number;
  multiplierSymbols: MultiplierSymbol[];
  globalMultiplier: number;
}

export interface SpinStep {
  stepIndex: number;
  grid: string[][];
  winningSymbols: WinningSymbol[];
  winAmount: number;
  stepMultiplier: number;
  appliedMultiplier: number;
  isTumble: boolean;
  multiplierSymbols: MultiplierSymbol[];
}

export interface WinningSymbol {
  symbolId: string;
  count: number;
  multiplier: number;
  baseWin: number;
}

export interface MultiplierSymbol {
  symbolId: string;
  value: number;
  position: { col: number; row: number };
}

export interface RNGWeights {
  [symbolId: string]: number;
}

export interface PaytableMap {
  [symbolId: string]: { [count: string]: number };
}

export class SlotMathEngine {
  private config: GameConfig;
  private paytableMap: PaytableMap;
  private rngWeights: RNGWeights;
  private symbolPool: string[];
  private totalWeight: number;
  private gridConfig: GridConfig;
  private mechanics: MechanicsConfig;
  private features: FeaturesConfig;
  private scatterConfig: ScatterConfig;
  private multiplierConfig: MultiplierConfig;
  private isFreeSpins: boolean;
  private globalMultiplier: number;
  private rng: () => number;

  constructor(config: GameConfig, rng?: () => number) {
    this.config = config;
    this.gridConfig = config.grid;
    this.mechanics = config.mechanics;
    this.features = config.features;
    this.scatterConfig = config.features.scatter;
    this.multiplierConfig = config.features.multipliers;
    this.isFreeSpins = false;
    this.globalMultiplier = 1;
    this.rng = rng || Math.random;

    this.paytableMap = this.buildPaytableMap(config.paytable);
    this.rngWeights = this.buildRNGWeights(config.paytable, config.features.scatter);
    this.symbolPool = this.buildSymbolPool(this.rngWeights);
    this.totalWeight = Object.values(this.rngWeights).reduce((sum, w) => sum + w, 0);
  }

  private buildPaytableMap(paytable: PaytableEntry[]): PaytableMap {
    const map: PaytableMap = {};
    for (const entry of paytable) {
      map[entry.id] = entry.pays;
    }
    map[this.scatterConfig.id] = this.scatterConfig.payouts;
    return map;
  }

  private buildRNGWeights(paytable: PaytableEntry[], scatterConfig: ScatterConfig): RNGWeights {
    const weights: RNGWeights = {};
    for (const entry of paytable) {
      weights[entry.id] = entry.weight;
    }
    weights[scatterConfig.id] = scatterConfig.weight;
    return weights;
  }

  private buildSymbolPool(weights: RNGWeights): string[] {
    const pool: string[] = [];
    for (const [symbolId, weight] of Object.entries(weights)) {
      for (let i = 0; i < weight; i++) {
        pool.push(symbolId);
      }
    }
    return pool;
  }

  public setFreeSpinsMode(enabled: boolean): void {
    this.isFreeSpins = enabled;
    if (!enabled) {
      this.globalMultiplier = 1;
    }
  }

  public getGlobalMultiplier(): number {
    return this.globalMultiplier;
  }

  public resetGlobalMultiplier(): void {
    this.globalMultiplier = 1;
  }

  private weightedRandomSymbol(): string {
    const randomIndex = Math.floor(this.rng() * this.symbolPool.length);
    return this.symbolPool[randomIndex];
  }

  private generateMultiplierSymbol(): MultiplierSymbol | null {
    if (!this.multiplierConfig.enabled) return null;

    const chancePct = this.isFreeSpins 
      ? this.multiplierConfig.freeSpinsChancePct 
      : this.multiplierConfig.baseGameChancePct;
    
    if (this.rng() * 100 >= chancePct) return null;

    const multiplierValue = this.multiplierConfig.values[
      Math.floor(this.rng() * this.multiplierConfig.values.length)
    ];

    const symbolIds = this.multiplierConfig.symbols;
    const symbolId = symbolIds[Math.floor(this.rng() * symbolIds.length)];

    return {
      symbolId,
      value: multiplierValue,
      position: { col: -1, row: -1 }
    };
  }

  public generateGrid(): string[][] {
    const grid: string[][] = [];
    for (let col = 0; col < this.gridConfig.columns; col++) {
      grid[col] = [];
      for (let row = 0; row < this.gridConfig.rows; row++) {
        grid[col][row] = this.weightedRandomSymbol();
      }
    }
    return grid;
  }

  public findWinningClusters(grid: string[][]): WinningSymbol[] {
    const symbolCounts: { [symbolId: string]: number } = {};
    const multiplierSymbols: MultiplierSymbol[] = [];

    for (let col = 0; col < this.gridConfig.columns; col++) {
      for (let row = 0; row < this.gridConfig.rows; row++) {
        const symbolId = grid[col][row];
        if (symbolId.startsWith('sym_mult_')) {
          const multSymbol = this.parseMultiplierSymbol(symbolId);
          if (multSymbol) {
            multiplierSymbols.push({ ...multSymbol, position: { col, row } });
          }
        } else {
          symbolCounts[symbolId] = (symbolCounts[symbolId] || 0) + 1;
        }
      }
    }

    const winningSymbols: WinningSymbol[] = [];
    const minClusterSize = this.mechanics.minClusterSize;

    for (const [symbolId, count] of Object.entries(symbolCounts)) {
      if (count >= minClusterSize) {
        const paytable = this.paytableMap[symbolId];
        if (paytable) {
          let multiplier = 0;
          if (count >= 12 && paytable['12'] !== undefined) {
            multiplier = paytable['12'];
          } else if (count >= 10 && paytable['10'] !== undefined) {
            multiplier = paytable['10'];
          } else if (paytable['8'] !== undefined) {
            multiplier = paytable['8'];
          }

          if (multiplier > 0) {
            winningSymbols.push({
              symbolId,
              count,
              multiplier,
              baseWin: multiplier
            });
          }
        }
      }
    }

    return winningSymbols;
  }

  private parseMultiplierSymbol(symbolId: string): MultiplierSymbol | null {
    for (const multSymbolId of this.multiplierConfig.symbols) {
      if (symbolId === multSymbolId || symbolId.startsWith(multSymbolId)) {
        const valueMatch = symbolId.match(/(\d+)$/);
        const value = valueMatch ? parseInt(valueMatch[1], 10) : 2;
        return { symbolId: multSymbolId, value, position: { col: -1, row: -1 } };
      }
    }
    return null;
  }

  public applyTumble(grid: string[][], winningSymbols: WinningSymbol[]): { newGrid: string[][]; newMultiplierSymbols: MultiplierSymbol[] } {
    const winningSymbolIds = new Set(winningSymbols.map(ws => ws.symbolId));
    const newGrid: string[][] = [];
    const newMultiplierSymbols: MultiplierSymbol[] = [];

    for (let col = 0; col < this.gridConfig.columns; col++) {
      newGrid[col] = [];
      const columnSymbols: string[] = [];

      for (let row = this.gridConfig.rows - 1; row >= 0; row--) {
        const symbolId = grid[col][row];
        
        if (symbolId.startsWith('sym_mult_')) {
          const multSymbol = this.parseMultiplierSymbol(symbolId);
          if (multSymbol) {
            newMultiplierSymbols.push({ ...multSymbol, position: { col, row } });
          }
          columnSymbols.push(symbolId);
        } else if (!winningSymbolIds.has(symbolId)) {
          columnSymbols.push(symbolId);
        }
      }

      const emptySlots = this.gridConfig.rows - columnSymbols.length;
      for (let i = 0; i < emptySlots; i++) {
        columnSymbols.push(this.weightedRandomSymbol());
      }

      for (let row = 0; row < this.gridConfig.rows; row++) {
        newGrid[col][row] = columnSymbols[row];
      }
    }

    return { newGrid, newMultiplierSymbols };
  }

  public calculateScatterWin(scatterCount: number): number {
    const payouts = this.scatterConfig.payouts;
    const countKey = scatterCount.toString();
    return payouts[countKey] || 0;
  }

  public checkFreeSpinsTrigger(scatterCount: number): { triggered: boolean; spins: number } {
    if (scatterCount >= this.scatterConfig.triggers.freeSpins.minCount) {
      return {
        triggered: true,
        spins: this.scatterConfig.triggers.freeSpins.spinsAwarded
      };
    }
    return { triggered: false, spins: 0 };
  }

  public checkFreeSpinsRetrigger(scatterCount: number): number {
    if (scatterCount >= this.scatterConfig.triggers.freeSpins.retriggerCount) {
      return this.scatterConfig.triggers.freeSpins.retriggerSpins;
    }
    return 0;
  }

  public playSpin(betAmount: number): SpinResult {
    this.globalMultiplier = this.isFreeSpins ? this.globalMultiplier : 1;
    
    let currentGrid = this.generateGrid();
    const spinHistory: SpinStep[] = [];
    let totalWin = 0;
    let totalMultiplier = 1;
    let allMultiplierSymbols: MultiplierSymbol[] = [];
    let scatterCount = 0;
    let stepIndex = 0;
    let hasWin = true;

    const initialScatterCount = this.countScatters(currentGrid);
    scatterCount = initialScatterCount;

    while (hasWin) {
      const winningSymbols = this.findWinningClusters(currentGrid);
      const multiplierSymbols = this.extractMultiplierSymbols(currentGrid);
      
      allMultiplierSymbols.push(...multiplierSymbols);

      let stepWin = 0;
      let stepMultiplier = 1;

      for (const ws of winningSymbols) {
        stepWin += ws.baseWin * betAmount;
      }

      for (const ms of multiplierSymbols) {
        stepMultiplier *= ms.value;
      }

      const appliedMultiplier = this.isFreeSpins && this.multiplierConfig.freeSpinsLogic.accumulateGlobalMultiplier
        ? this.globalMultiplier * stepMultiplier
        : stepMultiplier;

      const finalStepWin = stepWin * appliedMultiplier;
      totalWin += finalStepWin;

      if (this.isFreeSpins && this.multiplierConfig.freeSpinsLogic.accumulateGlobalMultiplier && stepMultiplier > 1) {
        this.globalMultiplier *= stepMultiplier;
        totalMultiplier = this.globalMultiplier;
      } else {
        totalMultiplier = appliedMultiplier;
      }

      spinHistory.push({
        stepIndex,
        grid: this.cloneGrid(currentGrid),
        winningSymbols,
        winAmount: finalStepWin,
        stepMultiplier,
        appliedMultiplier,
        isTumble: stepIndex > 0,
        multiplierSymbols
      });

      if (winningSymbols.length === 0 && multiplierSymbols.length === 0) {
        hasWin = false;
      } else {
        const tumbleResult = this.applyTumble(currentGrid, winningSymbols);
        currentGrid = tumbleResult.newGrid;
        allMultiplierSymbols.push(...tumbleResult.newMultiplierSymbols);
        stepIndex++;
      }
    }

    const freeSpinsCheck = this.checkFreeSpinsTrigger(scatterCount);
    const scatterWin = this.calculateScatterWin(scatterCount) * betAmount;
    totalWin += scatterWin;

    if (scatterWin > 0) {
      spinHistory.push({
        stepIndex: spinHistory.length,
        grid: this.cloneGrid(currentGrid),
        winningSymbols: [{
          symbolId: this.scatterConfig.id,
          count: scatterCount,
          multiplier: this.calculateScatterWin(scatterCount),
          baseWin: this.calculateScatterWin(scatterCount)
        }],
        winAmount: scatterWin,
        stepMultiplier: 1,
        appliedMultiplier: 1,
        isTumble: false,
        multiplierSymbols: []
      });
    }

    return {
      spinHistory,
      totalWin,
      totalMultiplier,
      freeSpinsTriggered: freeSpinsCheck.triggered,
      freeSpinsAwarded: freeSpinsCheck.spins,
      scatterCount,
      multiplierSymbols: allMultiplierSymbols,
      globalMultiplier: this.globalMultiplier
    };
  }

  private countScatters(grid: string[][]): number {
    let count = 0;
    for (let col = 0; col < this.gridConfig.columns; col++) {
      for (let row = 0; row < this.gridConfig.rows; row++) {
        if (grid[col][row] === this.scatterConfig.id) {
          count++;
        }
      }
    }
    return count;
  }

  private extractMultiplierSymbols(grid: string[][]): MultiplierSymbol[] {
    const symbols: MultiplierSymbol[] = [];
    for (let col = 0; col < this.gridConfig.columns; col++) {
      for (let row = 0; row < this.gridConfig.rows; row++) {
        const symbolId = grid[col][row];
        if (symbolId.startsWith('sym_mult_')) {
          const parsed = this.parseMultiplierSymbol(symbolId);
          if (parsed) {
            symbols.push({ ...parsed, position: { col, row } });
          }
        }
      }
    }
    return symbols;
  }

  private cloneGrid(grid: string[][]): string[][] {
    return grid.map(col => [...col]);
  }

  public getConfig(): GameConfig {
    return this.config;
  }

  public getPaytable(): PaytableMap {
    return { ...this.paytableMap };
  }

  public getRNGWeights(): RNGWeights {
    return { ...this.rngWeights };
  }
}

export function createSlotMathEngine(config: GameConfig, rng?: () => number): SlotMathEngine {
  return new SlotMathEngine(config, rng);
}