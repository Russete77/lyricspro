/**
 * Electron IPC Handlers
 * Handlers para comunicação entre o processo principal e o renderer
 */

const { ipcMain, app } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * Configura todos os handlers IPC
 */
function setupIpcHandlers() {
  // ============================================================================
  // Storage Handlers
  // ============================================================================

  /**
   * Obtém o caminho base de armazenamento
   */
  ipcMain.handle('storage:get-base-path', () => {
    const storagePath = path.join(app.getPath('userData'), 'storage');
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    return storagePath;
  });

  /**
   * Salva arquivo de upload
   */
  ipcMain.handle('storage:save-file', async (event, { userId, filename, buffer }) => {
    const storagePath = path.join(app.getPath('userData'), 'storage', 'uploads', userId);

    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }

    const timestamp = Date.now();
    const safeFilename = `${timestamp}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fullPath = path.join(storagePath, safeFilename);

    fs.writeFileSync(fullPath, Buffer.from(buffer));

    return {
      storagePath: fullPath,
      fileSize: buffer.length,
    };
  });

  /**
   * Lê arquivo de áudio
   */
  ipcMain.handle('storage:read-file', async (event, { storagePath }) => {
    if (!fs.existsSync(storagePath)) {
      throw new Error('Arquivo não encontrado');
    }

    return fs.readFileSync(storagePath);
  });

  /**
   * Deleta arquivo
   */
  ipcMain.handle('storage:delete-file', async (event, { storagePath }) => {
    if (fs.existsSync(storagePath)) {
      fs.unlinkSync(storagePath);
    }
    return true;
  });

  // ============================================================================
  // Database Handlers
  // ============================================================================

  /**
   * Obtém o caminho do banco de dados SQLite
   */
  ipcMain.handle('db:get-path', () => {
    return path.join(app.getPath('userData'), 'lyricspro.db');
  });

  // ============================================================================
  // Settings Handlers
  // ============================================================================

  /**
   * Salva configurações do usuário
   */
  ipcMain.handle('settings:save', async (event, settings) => {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  });

  /**
   * Carrega configurações do usuário
   */
  ipcMain.handle('settings:load', async () => {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');

    if (!fs.existsSync(settingsPath)) {
      // Retornar configurações padrão
      return {
        openaiApiKey: null,
        theme: 'system',
        language: 'pt',
      };
    }

    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data);
  });

  /**
   * Salva API key da OpenAI (criptografada)
   * TODO: Implementar criptografia real usando safeStorage
   */
  ipcMain.handle('settings:save-api-key', async (event, apiKey) => {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');

    let settings = {};
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      settings = JSON.parse(data);
    }

    settings.openaiApiKey = apiKey;

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  });

  /**
   * Obtém API key da OpenAI
   */
  ipcMain.handle('settings:get-api-key', async () => {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');

    if (!fs.existsSync(settingsPath)) {
      return null;
    }

    const data = fs.readFileSync(settingsPath, 'utf-8');
    const settings = JSON.parse(data);

    return settings.openaiApiKey || null;
  });

  // ============================================================================
  // App Info Handlers
  // ============================================================================

  /**
   * Obtém informações do app
   */
  ipcMain.handle('app:get-info', () => {
    return {
      version: app.getVersion(),
      name: app.getName(),
      isElectron: true,
      platform: process.platform,
      userDataPath: app.getPath('userData'),
    };
  });

  /**
   * Obtém uso de storage
   */
  ipcMain.handle('app:get-storage-usage', async () => {
    const storagePath = path.join(app.getPath('userData'), 'storage', 'uploads');

    if (!fs.existsSync(storagePath)) {
      return { totalBytes: 0, fileCount: 0 };
    }

    let totalBytes = 0;
    let fileCount = 0;

    const calculateSizeRecursive = (dirPath) => {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          calculateSizeRecursive(fullPath);
        } else {
          totalBytes += stats.size;
          fileCount++;
        }
      }
    };

    calculateSizeRecursive(storagePath);

    return { totalBytes, fileCount };
  });

  console.log('[Electron] IPC Handlers configurados');
}

module.exports = { setupIpcHandlers };
