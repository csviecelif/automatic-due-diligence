
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

// --- Gerenciamento de Dados ---
const userDataPath = app.getPath('userData');
const dataFilePath = path.join(userDataPath, 'relationship-web-builder-data.json');

function saveData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Falha ao salvar os dados:', error);
    dialog.showErrorBox('Erro ao Salvar', 'Não foi possível salvar os dados. Verifique as permissões do arquivo.');
  }
}

function loadData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const rawData = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error('Falha ao carregar os dados:', error);
    dialog.showErrorBox('Erro ao Carregar', 'Não foi possível carregar os dados. O arquivo pode estar corrompido.');
  }
  // Se o arquivo não existir ou houver um erro, retorna null para a aplicação carregar os dados mock.
  return null;
}

// --- Configuração da Janela Principal ---
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'assets', 'favicon.ico') // Exemplo de caminho para ícone
  });

  // Carrega a URL do Vite em desenvolvimento ou o build em produção
  win.loadURL(
    isDev
      ? 'http://localhost:5173' // URL padrão do Vite dev server
      : `file://${path.join(__dirname, 'dist', 'index.html')}`
  );

  // Abre o DevTools em desenvolvimento
  if (isDev) {
    win.webContents.openDevTools();
  }
}

// --- Ciclo de Vida da Aplicação ---
app.whenReady().then(() => {
  // Configura os listeners para comunicação entre processos
  ipcMain.handle('load-data', () => {
    return loadData();
  });

  ipcMain.on('save-data', (event, data) => {
    saveData(data);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
