export interface AssetFile {
  file: File;
  preview: string;
  name: string;
}

export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function createAssetInput(accept = 'image/*'): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.style.display = 'none';
  return input;
}

export async function handleFileUpload(input: HTMLInputElement): Promise<AssetFile | null> {
  const file = input.files?.[0];
  if (!file) return null;
  
  if (!file.type.startsWith('image/')) {
    alert('Apenas arquivos de imagem são permitidos');
    return null;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Arquivo muito grande (máx 5MB)');
    return null;
  }
  
  const preview = await fileToDataURL(file);
  return { file, preview, name: file.name };
}

export function downloadJSON(config: object, filename: string): void {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadThemePackage(config: any): Promise<void> {
  const zip = await createThemeZip(config);
  const url = URL.createObjectURL(zip);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.gameMetadata.gameId}_theme.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

async function createThemeZip(config: any): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  zip.file('config.json', JSON.stringify(config, null, 2));
  
  const assetsFolder = zip.folder('assets');
  if (!assetsFolder) throw new Error('Erro ao criar pasta assets');
  
  for (const symbol of config.symbols) {
    const symbolFolder = assetsFolder.folder(symbol.id);
    if (!symbolFolder) continue;
    
    for (const [state, dataUrl] of Object.entries(symbol.assets)) {
      if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
        const base64 = dataUrl.split(',')[1];
        symbolFolder.file(`${state}.png`, base64, { base64: true });
      }
    }
  }
  
  return zip.generateAsync({ type: 'blob' });
}

export function generateGameId(): string {
  return `slot_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
}