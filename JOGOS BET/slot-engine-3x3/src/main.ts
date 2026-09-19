import { SlotEngine, createSlotEngine } from './core/SlotEngine';
import { DEFAULT_CONFIG, GameConfig, TargetMatrix } from './core/config';
import './styles/main.css';

const container = document.getElementById('app') as HTMLElement;

let engine: SlotEngine;
let balance = 10000;
const BET_AMOUNT = 100;

function generateRandomResult(config: GameConfig): TargetMatrix {
  const { columns, rows } = config.gameMetadata.grid;
  const symbols = config.symbols.map(s => s.id);
  const matrix: TargetMatrix = [];
  
  for (let col = 0; col < columns; col++) {
    matrix[col] = [];
    for (let row = 0; row < rows; row++) {
      const symbolId = symbols[Math.floor(Math.random() * symbols.length)];
      matrix[col][row] = symbolId;
    }
  }
  return matrix;
}

function forceWinResult(config: GameConfig): TargetMatrix {
  const { columns, rows } = config.gameMetadata.grid;
  const symbols = config.symbols.map(s => s.id);
  const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  const matrix: TargetMatrix = [];
  
  for (let col = 0; col < columns; col++) {
    matrix[col] = [];
    for (let row = 0; row < rows; row++) {
      if (Math.random() < 0.7) {
        matrix[col][row] = winSymbol;
      } else {
        matrix[col][row] = symbols[Math.floor(Math.random() * symbols.length)];
      }
    }
  }
  return matrix;
}

async function init() {
  engine = createSlotEngine({
    container,
    config: DEFAULT_CONFIG,
    onSpinComplete: (result) => {
      console.log('Spin complete:', result);
      updateBalanceDisplay();
    },
    onWinAnimationComplete: () => {
      console.log('Win animation complete');
    }
  });

  await engine.initialize();
  setupControls();
  updateBalanceDisplay();
}

function setupControls(): void {
  const spinBtn = document.getElementById('spin-btn') as HTMLButtonElement;
  const forceWinBtn = document.getElementById('force-win-btn') as HTMLButtonElement;
  
  spinBtn?.addEventListener('click', async () => {
    if (balance < BET_AMOUNT) {
      alert('Saldo insuficiente!');
      return;
    }
    
    balance -= BET_AMOUNT;
    updateBalanceDisplay();
    spinBtn.disabled = true;
    forceWinBtn.disabled = true;
    
    const result = generateRandomResult(DEFAULT_CONFIG);
    await engine.spinToResult(result);
    
    spinBtn.disabled = false;
    forceWinBtn.disabled = false;
  });
  
  forceWinBtn?.addEventListener('click', async () => {
    if (balance < BET_AMOUNT) {
      alert('Saldo insuficiente!');
      return;
    }
    
    balance -= BET_AMOUNT;
    updateBalanceDisplay();
    spinBtn.disabled = true;
    forceWinBtn.disabled = true;
    
    const result = forceWinResult(DEFAULT_CONFIG);
    await engine.spinToResult(result);
    
    spinBtn.disabled = false;
    forceWinBtn.disabled = false;
  });
}

function updateBalanceDisplay(): void {
  const balanceEl = document.getElementById('balance');
  if (balanceEl) {
    balanceEl.textContent = balance.toLocaleString();
  }
}

function renderUI(): void {
  container.innerHTML = `
    <div style="text-align: center; width: 100%; max-width: 500px;">
      <h1 style="font-size: 28px; font-weight: 800; background: linear-gradient(90deg, var(--primary-neon), var(--win-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
        Slot Engine 3x3
      </h1>
      <p style="color: var(--primary-neon); font-size: 14px; margin-bottom: 24px;">Camaleão White-Label Renderer</p>
      
      <div id="app" style="margin-bottom: 24px;"></div>
      
      <div class="game-info">
        <div>Saldo: <span id="balance" style="font-weight: 700;">10000</span></div>
        <div>Aposta: <span style="font-weight: 700;">${BET_AMOUNT}</span></div>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button id="spin-btn" class="spin-button">GIRAR</button>
        <button id="force-win-btn" class="spin-button" style="background: linear-gradient(135deg, var(--win-color), var(--primary-neon));">FORÇAR VITÓRIA</button>
      </div>
    </div>
  `;
}

renderUI();
init().catch(console.error);