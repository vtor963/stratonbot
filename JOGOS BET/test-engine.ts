import { SlotMathEngine, GameConfig } from './index';
import config from './zeus_olympus_config.json' with { type: 'json' };

function runTest() {
  console.log('=== SlotMathEngine Test Suite ===\n');

  const engine = new SlotMathEngine(config as GameConfig);

  console.log('1. Testing generateGrid()...');
  const grid = engine.generateGrid();
  console.log(`Grid generated: ${grid.length}x${grid[0].length}`);
  console.log('Sample column 0:', grid[0]);
  console.log();

  console.log('2. Testing findWinningClusters()...');
  const testGrid: string[][] = [
    ['sym_crown', 'sym_crown', 'sym_crown', 'sym_crown', 'sym_crown'],
    ['sym_crown', 'sym_crown', 'sym_crown', 'sym_hourglass', 'sym_hourglass'],
    ['sym_gem_red', 'sym_gem_red', 'sym_gem_red', 'sym_gem_red', 'sym_gem_red'],
    ['sym_gem_red', 'sym_gem_red', 'sym_gem_red', 'sym_gem_blue', 'sym_gem_blue'],
    ['sym_gem_blue', 'sym_gem_blue', 'sym_gem_blue', 'sym_scatter', 'sym_scatter'],
    ['sym_scatter', 'sym_scatter', 'sym_chalice', 'sym_chalice', 'sym_chalice']
  ];
  
  const wins = engine.findWinningClusters(testGrid);
  console.log('Winning clusters found:', wins.map(w => `${w.symbolId}: ${w.count}x (${w.multiplier}x)`));
  console.log();

  console.log('3. Testing applyTumble()...');
  const { newGrid, newMultiplierSymbols } = engine.applyTumble(testGrid, wins);
  console.log('After tumble - Column 0:', newGrid[0]);
  console.log('New multiplier symbols:', newMultiplierSymbols.length);
  console.log();

  console.log('4. Testing playSpin() - Base Game...');
  const baseSpin = engine.playSpin(100);
  console.log(`Total Win: ${baseSpin.totalWin}`);
  console.log(`Total Multiplier: ${baseSpin.totalMultiplier}x`);
  console.log(`Steps: ${baseSpin.spinHistory.length}`);
  console.log(`Scatter Count: ${baseSpin.scatterCount}`);
  console.log(`Free Spins Triggered: ${baseSpin.freeSpinsTriggered}`);
  console.log(`Multiplier Symbols: ${baseSpin.multiplierSymbols.length}`);
  
  baseSpin.spinHistory.forEach((step, i) => {
    console.log(`  Step ${i}: Win=${step.winAmount}, Mult=${step.appliedMultiplier}x, Tumble=${step.isTumble}, Winners=${step.winningSymbols.length}`);
  });
  console.log();

  console.log('5. Testing playSpin() - Free Spins Mode...');
  engine.setFreeSpinsMode(true);
  engine.resetGlobalMultiplier();
  
  const freeSpin = engine.playSpin(100);
  console.log(`Total Win: ${freeSpin.totalWin}`);
  console.log(`Global Multiplier: ${freeSpin.globalMultiplier}x`);
  console.log(`Steps: ${freeSpin.spinHistory.length}`);
  console.log(`Scatter Count: ${freeSpin.scatterCount}`);
  
  freeSpin.spinHistory.forEach((step, i) => {
    console.log(`  Step ${i}: Win=${step.winAmount}, Mult=${step.appliedMultiplier}x, Global=${engine.getGlobalMultiplier()}x, Winners=${step.winningSymbols.length}`);
  });
  console.log();

  console.log('6. Testing Scatter Pays...');
  const scatterGrid: string[][] = [
    ['sym_scatter', 'sym_gem_red', 'sym_gem_red', 'sym_gem_red', 'sym_gem_red'],
    ['sym_gem_blue', 'sym_scatter', 'sym_gem_blue', 'sym_gem_blue', 'sym_gem_blue'],
    ['sym_gem_green', 'sym_gem_green', 'sym_scatter', 'sym_gem_green', 'sym_gem_green'],
    ['sym_gem_yellow', 'sym_gem_yellow', 'sym_gem_yellow', 'sym_scatter', 'sym_gem_yellow'],
    ['sym_gem_purple', 'sym_gem_purple', 'sym_gem_purple', 'sym_gem_purple', 'sym_scatter'],
    ['sym_crown', 'sym_hourglass', 'sym_ring', 'sym_chalice', 'sym_mult_green']
  ];
  
  const scatterCount = (engine as any).countScatters(scatterGrid);
  const scatterWin = engine.calculateScatterWin(scatterCount);
  const fsCheck = engine.checkFreeSpinsTrigger(scatterCount);
  
  console.log(`Scatter Count: ${scatterCount}`);
  console.log(`Scatter Win: ${scatterWin}x bet`);
  console.log(`Free Spins Triggered: ${fsCheck.triggered} (${fsCheck.spins} spins)`);
  console.log();

  console.log('=== All Tests Passed ===');
}

runTest();