import { SlotEngine, createSlotEngine } from './core/SlotEngine';
import { 
  DEFAULT_CONFIG, 
  GameConfig, 
  SymbolConfig, 
  TargetMatrix,
  validateConfig,
  configToJSON,
  parseConfigJSON,
  createEmptySymbol,
  generateGameId
} from './core/config';
import { 
  handleFileUpload, 
  createAssetInput, 
  downloadJSON, 
  downloadThemePackage 
} from './core/assets';
import './styles/main.css';

class ThemeBuilder {
  private config: GameConfig = { ...DEFAULT_CONFIG };
  private engine: SlotEngine | null = null;
  private assetInputs: Map<string, Map<string, HTMLInputElement>> = new Map();
  private logEl: HTMLElement | null = null;
  private spinBtn: HTMLButtonElement | null = null;
  private exportJsonBtn: HTMLButtonElement | null = null;
  private exportZipBtn: HTMLButtonElement | null = null;

  async init(): Promise<void> {
    this.render();
    this.bindEvents();
    await this.initEngine();
    this.log('info', 'Theme Builder carregado. Arraste imagens ou clique para upload.');
  }

  private render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <header class="builder-header">
        <h1 class="builder-title">🎰 Slot Theme Builder</h1>
        <div class="builder-actions">
          <button id="btn-load-config" class="btn btn-secondary">📂 Carregar JSON</button>
          <button id="btn-save-config" class="btn btn-secondary">💾 Salvar JSON</button>
          <button id="btn-new-theme" class="btn btn-secondary">🆕 Novo Tema</button>
        </div>
      </header>

      <div class="main-content">
        <aside class="panel" style="width: 420px;">
          <div class="panel-title">🎨 Cores do Tema</div>
          <div class="color-group" id="colors-panel"></div>

          <div class="panel-title" style="margin-top: 24px;">🐉 Símbolos</div>
          <div class="symbols-list" id="symbols-list"></div>
          <button id="btn-add-symbol" class="add-symbol-btn">+ Adicionar Símbolo</button>

          <div class="export-panel">
            <div class="panel-title">📦 Exportar</div>
            <div class="export-buttons">
              <button id="btn-export-json" class="export-btn export-btn-json" disabled>
                📄 Exportar config.json
              </button>
              <button id="btn-export-zip" class="export-btn export-btn-zip" disabled>
                📦 Exportar Pacote Completo (.zip)
              </button>
            </div>
          </div>

          <div class="log-panel" id="log-panel"></div>
        </aside>

        <main class="panel preview-panel" style="flex: 1; min-width: 0;">
          <div class="preview-header">
            <span class="preview-title">🔴 Preview Ao Vivo</span>
            <button id="btn-spin" class="spin-btn" disabled>GIRAR</button>
          </div>
          <div id="slot-container" style="width: 100%; max-width: 500px; margin: 0 auto;"></div>
          <p style="text-align: center; color: #666; font-size: 12px; margin-top: 12px;">
            O motor usa apenas CSS transform + cubic-bezier. Zero canvas, 60fps garantido.
          </p>
        </main>
      </div>

      <input type="file" id="file-config-loader" accept=".json" style="display: none;">
    `;

    this.logEl = document.getElementById('log-panel')!;
    this.spinBtn = document.getElementById('btn-spin') as HTMLButtonElement;
    this.exportJsonBtn = document.getElementById('btn-export-json') as HTMLButtonElement;
    this.exportZipBtn = document.getElementById('btn-export-zip') as HTMLButtonElement;

    this.renderColorsPanel();
    this.renderSymbolsList();
  }

  private renderColorsPanel(): void {
    const panel = document.getElementById('colors-panel');
    if (!panel) return;

    const { colors } = this.config.theme;
    panel.innerHTML = `
      <div class="color-row">
        <span class="color-label">Background Principal</span>
        <input type="color" class="color-input" data-color="backgroundMain" value="${colors.backgroundMain}">
        <span class="color-hex" data-hex="backgroundMain">${colors.backgroundMain}</span>
      </div>
      <div class="color-row">
        <span class="color-label">Background Grid</span>
        <input type="color" class="color-input" data-color="backgroundGrid" value="${colors.backgroundGrid}">
        <span class="color-hex" data-hex="backgroundGrid">${colors.backgroundGrid}</span>
      </div>
      <div class="color-row">
        <span class="color-label">Neon Primário</span>
        <input type="color" class="color-input" data-color="primaryNeon" value="${colors.primaryNeon}">
        <span class="color-hex" data-hex="primaryNeon">${colors.primaryNeon}</span>
      </div>
      <div class="color-row">
        <span class="color-label">Destaque Vitória</span>
        <input type="color" class="color-input" data-color="winHighlight" value="${colors.winHighlight}">
        <span class="color-hex" data-hex="winHighlight">${colors.winHighlight}</span>
      </div>
    `;

    panel.querySelectorAll('.color-input').forEach(input => {
      input.addEventListener('input', (e) => this.handleColorChange(e.target as HTMLInputElement));
    });
  }

  private renderSymbolsList(): void {
    const list = document.getElementById('symbols-list');
    if (!list) return;

    this.assetInputs.clear();
    list.innerHTML = '';

    this.config.symbols.forEach((symbol, index) => {
      const card = this.createSymbolCard(symbol, index);
      list.appendChild(card);
    });
  }

  private createSymbolCard(symbol: SymbolConfig, index: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'symbol-card';
    card.dataset.symbolId = symbol.id;

    const states = [
      { key: 'idle', label: 'IDLE (Parado)' },
      { key: 'spin', label: 'SPIN (Blur)' },
      { key: 'win', label: 'WIN (Glow)' }
    ];

    const symbolInputs = new Map<string, HTMLInputElement>();
    states.forEach(({ key }) => {
      const input = createAssetInput('image/*');
      input.dataset.symbolId = symbol.id;
      input.dataset.state = key;
      symbolInputs.set(key, input);
      document.body.appendChild(input);
    });
    this.assetInputs.set(symbol.id, symbolInputs);

    card.innerHTML = `
      <div class="symbol-header">
        <span class="symbol-id">${symbol.id}</span>
        <input type="text" class="symbol-name-input" value="${symbol.name}" data-field="name">
        <div class="symbol-actions">
          <button class="btn-icon" data-action="duplicate" title="Duplicar">📋</button>
          <button class="btn-icon" data-action="delete" title="Excluir">🗑️</button>
        </div>
      </div>
      <div class="asset-rows">
        ${states.map(({ key, label }) => `
          <div class="asset-row">
            <span class="asset-label">${label}</span>
            <div class="asset-dropzone" data-symbol-id="${symbol.id}" data-state="${key}">
              ${symbol.assets[key] ? `
                <img class="asset-preview" src="${symbol.assets[key]}" alt="${key}">
              ` : `
                <span class="asset-dropzone-text">Arraste ou clique para ${key === 'idle' ? 'carregar' : 'opcional'}</span>
              `}
            </div>
          </div>
        `).join('')}
        <div class="asset-actions">
          <button class="btn-small btn-danger" data-action="clear-all" data-symbol-id="${symbol.id}">Limpar Tudo</button>
        </div>
      </div>
    `;

    this.bindSymbolCardEvents(card, symbol);
    return card;
  }

  private bindSymbolCardEvents(card: HTMLElement, symbol: SymbolConfig): void {
    card.querySelector('.symbol-name-input')?.addEventListener('change', (e) => {
      symbol.name = (e.target as HTMLInputElement).value;
    });

    card.querySelectorAll('[data-action="duplicate"]').forEach(btn => {
      btn.addEventListener('click', () => this.duplicateSymbol(symbol.id));
    });

    card.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSymbol(symbol.id));
    });

    card.querySelectorAll('[data-action="clear-all"]').forEach(btn => {
      btn.addEventListener('click', () => this.clearSymbolAssets(symbol.id));
    });

    card.querySelectorAll('.asset-dropzone').forEach((dropzone: Element) => {
      const dz = dropzone as HTMLElement;
      const symbolId = dz.dataset.symbolId!;
      const state = dz.dataset.state!;
      const input = this.assetInputs.get(symbolId)?.get(state)!;

      dz.addEventListener('click', () => input.click());
      dz.addEventListener('dragover', (e) => {
        e.preventDefault();
        dz.classList.add('drag-over');
      });
      dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
      dz.addEventListener('drop', (e: Event) => {
        const de = e as DragEvent;
        e.preventDefault();
        dz.classList.remove('drag-over');
        const file = de.dataTransfer?.files[0];
        if (file) this.handleAssetFile(symbolId, state, file, dz);
      });

      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (file) this.handleAssetFile(symbolId, state, file, dz);
      });
    });
  }

  private async handleAssetFile(symbolId: string, state: string, file: File, dropzone: HTMLElement): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this.log('error', 'Apenas imagens permitidas');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.log('error', 'Arquivo > 5MB');
      return;
    }

    const dataUrl = await fileToDataURL(file);
    const symbol = this.config.symbols.find(s => s.id === symbolId);
    if (symbol) {
      symbol.assets[state] = dataUrl;
      this.updateDropzonePreview(dropzone, dataUrl);
      this.log('success', `${symbolId}.${state} atualizado`);
      this.updateEngineConfig();
    }
  }

  private updateDropzonePreview(dropzone: HTMLElement, dataUrl: string): void {
    dropzone.classList.add('has-image');
    dropzone.innerHTML = `<img class="asset-preview" src="${dataUrl}" alt="">`;
  }

  private handleColorChange(input: HTMLInputElement): void {
    const colorKey = input.dataset.color!;
    const hexEl = document.querySelector(`[data-hex="${colorKey}"]`);
    
    (this.config.theme.colors as any)[colorKey] = input.value;
    if (hexEl) hexEl.textContent = input.value;
    
    this.updateEngineConfig();
  }

  private async initEngine(): Promise<void> {
    const container = document.getElementById('slot-container');
    if (!container) return;

    this.engine = createSlotEngine({
      container,
      config: this.config,
      onSpinComplete: () => this.enableSpinButton(),
      onWinAnimationComplete: () => this.log('success', 'Animação de vitória concluída')
    });

    this.spinBtn!.disabled = false;
    this.exportJsonBtn!.disabled = false;
    this.exportZipBtn!.disabled = false;
  }

  private updateEngineConfig(): void {
    if (this.engine) {
      this.engine.updateConfig(this.config);
    }
  }

  private bindEvents(): void {
    document.getElementById('btn-spin')?.addEventListener('click', () => this.spin());
    document.getElementById('btn-add-symbol')?.addEventListener('click', () => this.addSymbol());
    document.getElementById('btn-export-json')?.addEventListener('click', () => this.exportJSON());
    document.getElementById('btn-export-zip')?.addEventListener('click', () => this.exportZIP());
    document.getElementById('btn-save-config')?.addEventListener('click', () => this.exportJSON());
    document.getElementById('btn-load-config')?.addEventListener('click', () => this.loadConfig());
    document.getElementById('btn-new-theme')?.addEventListener('click', () => this.newTheme());

    document.getElementById('file-config-loader')?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) this.loadConfigFile(file);
    });
  }

  private spin(): void {
    if (!this.engine || this.spinBtn!.disabled) return;
    
    this.spinBtn!.disabled = true;
    this.log('info', 'Girando...');

    const { columns, rows } = this.config.gameMetadata.grid;
    const symbols = this.config.symbols.map(s => s.id);
    const matrix: TargetMatrix = [];

    for (let col = 0; col < columns; col++) {
      matrix[col] = [];
      for (let row = 0; row < rows; row++) {
        const symbolId = symbols[Math.floor(Math.random() * symbols.length)];
        matrix[col][row] = symbolId;
      }
    }

    this.engine.spinToResult(matrix);
  }

  private enableSpinButton(): void {
    this.spinBtn!.disabled = false;
  }

  private addSymbol(): void {
    const newId = `SYM_CUSTOM_${Date.now().toString(36).toUpperCase()}`;
    const newSymbol = createEmptySymbol(newId, `Novo Símbolo ${this.config.symbols.length + 1}`);
    this.config.symbols.push(newSymbol);
    this.renderSymbolsList();
    this.updateEngineConfig();
    this.log('success', `Símbolo ${newId} adicionado`);
  }

  private duplicateSymbol(symbolId: string): void {
    const symbol = this.config.symbols.find(s => s.id === symbolId);
    if (!symbol) return;

    const newId = `${symbolId}_COPY_${Date.now().toString(36)}`;
    const newSymbol: SymbolConfig = {
      id: newId,
      name: `${symbol.name} (Cópia)`,
      assets: { ...symbol.assets }
    };
    this.config.symbols.push(newSymbol);
    this.renderSymbolsList();
    this.updateEngineConfig();
    this.log('success', `Símbolo duplicado: ${newId}`);
  }

  private deleteSymbol(symbolId: string): void {
    if (this.config.symbols.length <= 1) {
      this.log('error', 'Mínimo 1 símbolo necessário');
      return;
    }
    this.config.symbols = this.config.symbols.filter(s => s.id !== symbolId);
    this.renderSymbolsList();
    this.updateEngineConfig();
    this.log('warn', `Símbolo ${symbolId} removido`);
  }

  private clearSymbolAssets(symbolId: string): void {
    const symbol = this.config.symbols.find(s => s.id === symbolId);
    if (!symbol) return;

    symbol.assets = { idle: '', spin: '', win: '' };
    this.renderSymbolsList();
    this.updateEngineConfig();
    this.log('warn', `Assets de ${symbolId} limpos`);
  }

  private exportJSON(): void {
    const validation = validateConfig(this.config);
    if (!validation.valid) {
      this.log('error', `Config inválida: ${validation.errors.join(', ')}`);
      return;
    }
    downloadJSON(this.config, `${this.config.gameMetadata.gameId}_config.json`);
    this.log('success', 'config.json baixado');
  }

  private async exportZIP(): Promise<void> {
    const validation = validateConfig(this.config);
    if (!validation.valid) {
      this.log('error', `Config inválida: ${validation.errors.join(', ')}`);
      return;
    }
    try {
      this.log('info', 'Gerando pacote .zip...');
      await downloadThemePackage(this.config);
      this.log('success', 'Pacote .zip baixado com config.json + assets/');
    } catch (err) {
      this.log('error', `Erro ao gerar ZIP: ${err}`);
    }
  }

  private loadConfig(): void {
    (document.getElementById('file-config-loader') as HTMLInputElement).click();
  }

  private loadConfigFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const parsed = parseConfigJSON(json);
        if (parsed) {
          this.config = parsed;
          this.config.gameMetadata.gameId = generateGameId();
          this.renderColorsPanel();
          this.renderSymbolsList();
          this.updateEngineConfig();
          this.log('success', 'Configuração carregada do arquivo');
        } else {
          this.log('error', 'JSON inválido');
        }
      } catch {
        this.log('error', 'Erro ao ler arquivo');
      }
    };
    reader.readAsText(file);
  }

  private newTheme(): void {
    this.config = {
      ...DEFAULT_CONFIG,
      gameMetadata: { ...DEFAULT_CONFIG.gameMetadata, gameId: generateGameId() }
    };
    this.renderColorsPanel();
    this.renderSymbolsList();
    this.updateEngineConfig();
    this.log('info', 'Novo tema criado');
  }

  private log(level: 'info' | 'success' | 'error' | 'warn', message: string): void {
    if (!this.logEl) return;
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${level}`;
    entry.textContent = `[${time}] ${message}`;
    this.logEl.insertBefore(entry, this.logEl.firstChild);
    while (this.logEl.children.length > 50) {
      this.logEl.removeChild(this.logEl.lastChild!);
    }
  }
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

new ThemeBuilder().init();