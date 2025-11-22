const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const { setupIpcHandlers } = require('./electron-handlers');

// Detectar modo dev sem dependência externa
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let nextServer;

// Função para iniciar o servidor Next.js
function startNextServer() {
  return new Promise((resolve, reject) => {
    console.log('[Electron] Iniciando servidor Next.js...');

    if (isDev) {
      // Desenvolvimento: usa next dev
      const command = 'npm';
      const args = ['run', 'dev'];

      nextServer = spawn(command, args, {
        cwd: __dirname,
        shell: true,
        env: { ...process.env, ELECTRON: 'true' }
      });

      nextServer.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('[Next.js]', output);

        // Detecta quando o servidor está pronto
        if (output.includes('Ready') || output.includes('started server')) {
          resolve();
        }
      });

      nextServer.stderr.on('data', (data) => {
        console.error('[Next.js Error]', data.toString());
      });

      nextServer.on('error', (error) => {
        console.error('[Next.js] Erro ao iniciar:', error);
        reject(error);
      });

      // Timeout de 30 segundos
      setTimeout(() => {
        resolve(); // Resolve mesmo sem confirmação
      }, 30000);
    } else {
      // Produção: iniciar servidor Next.js em processo Node.js separado
      console.log('[Electron] Modo produção detectado');

      // Em produção, o app está em resources/app
      const appPath = app.getAppPath();
      const standaloneDir = path.join(appPath, '.next', 'standalone');
      const serverPath = path.join(standaloneDir, 'server.js');

      console.log('[Electron] AppPath:', appPath);
      console.log('[Electron] Servidor standalone:', serverPath);

      // Verificar se arquivo existe
      const fs = require('fs');
      if (!fs.existsSync(serverPath)) {
        console.error('[Electron] ERRO: server.js não encontrado em:', serverPath);
        reject(new Error('server.js não encontrado'));
        return;
      }

      // Iniciar servidor em processo Node.js separado (evita conflitos com módulos nativos)
      console.log('[Electron] Iniciando servidor Next.js em processo separado...');

      nextServer = spawn('node', [serverPath], {
        cwd: standaloneDir,
        shell: true,
        env: {
          ...process.env,
          ELECTRON: 'true',
          PORT: '3000',
          HOSTNAME: 'localhost',
          NODE_ENV: 'production'
        }
      });

      nextServer.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('[Next.js]', output);

        // Detecta quando o servidor está pronto
        if (output.includes('Local:') || output.includes('started server') || output.includes('Ready')) {
          console.log('[Electron] Servidor Next.js está pronto!');
          resolve();
        }
      });

      nextServer.stderr.on('data', (data) => {
        console.error('[Next.js Error]', data.toString());
      });

      nextServer.on('error', (error) => {
        console.error('[Next.js] Erro ao iniciar:', error);
        reject(error);
      });

      nextServer.on('exit', (code) => {
        console.log('[Next.js] Processo encerrado com código:', code);
        if (code !== 0 && code !== null) {
          console.error('[Next.js] Servidor encerrou com erro');
        }
      });

      // Timeout de 30 segundos - resolve mesmo sem confirmação
      setTimeout(() => {
        console.log('[Electron] Timeout atingido, assumindo que servidor está pronto');
        resolve();
      }, 30000);
    }
  });
}

// Função para criar a janela principal
async function createWindow() {
  console.log('[Electron] Criando janela principal...');
  console.log('[Electron] isDev:', isDev);
  console.log('[Electron] app.isPackaged:', app.isPackaged);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0f172a', // Cor de fundo do seu app
    icon: path.join(__dirname, 'public', 'icon.png'), // Ícone (vamos criar depois)
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: true, // Mostrar imediatamente para ver o que está acontecendo
  });

  // Abrir DevTools para ver erros
  mainWindow.webContents.openDevTools();

  // Aguardar Next.js estar pronto
  try {
    await startNextServer();
  } catch (error) {
    console.error('[Electron] Erro ao iniciar servidor:', error);
  }

  // Aguardar 2 segundos extras para garantir
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Carregar a aplicação
  const url = isDev
    ? 'http://localhost:3000'
    : 'http://localhost:3000';

  console.log('[Electron] Carregando URL:', url);

  try {
    await mainWindow.loadURL(url);
    console.log('[Electron] URL carregada com sucesso');
  } catch (error) {
    console.error('[Electron] Erro ao carregar URL:', error);
    // Mostrar erro na janela
    mainWindow.loadURL(`data:text/html,<html><body><h1>Erro ao carregar aplicação</h1><pre>${error.stack}</pre></body></html>`);
  }

  // Quando a janela for fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Quando o Electron estiver pronto
app.whenReady().then(async () => {
  console.log('[Electron] App pronto');

  // Configurar handlers IPC
  setupIpcHandlers();

  await createWindow();

  // No macOS, recriar janela quando clicar no dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  console.log('[Electron] Todas as janelas fechadas');

  // Fechar servidor Next.js
  if (nextServer) {
    console.log('[Electron] Encerrando servidor Next.js...');
    nextServer.kill();
  }

  // No macOS, apps geralmente ficam ativos até Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Antes de sair
app.on('before-quit', () => {
  console.log('[Electron] Encerrando aplicação...');

  // Fechar servidor Next.js
  if (nextServer) {
    console.log('[Electron] Matando processo Node.js...');
    nextServer.kill('SIGTERM');
  }
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('[Electron] Erro não capturado:', error);
});
