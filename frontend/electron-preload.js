const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer process (Next.js)
contextBridge.exposeInMainWorld('electron', {
  // ============================================================================
  // Informações sobre o ambiente
  // ============================================================================
  platform: process.platform,
  isElectron: true,

  // ============================================================================
  // Storage APIs
  // ============================================================================
  storage: {
    getBasePath: () => ipcRenderer.invoke('storage:get-base-path'),
    saveFile: (userId, filename, buffer) =>
      ipcRenderer.invoke('storage:save-file', { userId, filename, buffer }),
    readFile: (storagePath) =>
      ipcRenderer.invoke('storage:read-file', { storagePath }),
    deleteFile: (storagePath) =>
      ipcRenderer.invoke('storage:delete-file', { storagePath }),
  },

  // ============================================================================
  // Database APIs
  // ============================================================================
  db: {
    getPath: () => ipcRenderer.invoke('db:get-path'),
  },

  // ============================================================================
  // Settings APIs
  // ============================================================================
  settings: {
    save: (settings) => ipcRenderer.invoke('settings:save', settings),
    load: () => ipcRenderer.invoke('settings:load'),
    saveApiKey: (apiKey) => ipcRenderer.invoke('settings:save-api-key', apiKey),
    getApiKey: () => ipcRenderer.invoke('settings:get-api-key'),
  },

  // ============================================================================
  // App Info APIs
  // ============================================================================
  app: {
    getInfo: () => ipcRenderer.invoke('app:get-info'),
    getStorageUsage: () => ipcRenderer.invoke('app:get-storage-usage'),
  },

  // ============================================================================
  // Update APIs (para implementar depois)
  // ============================================================================
  updates: {
    onAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  },
});

console.log('[Preload] Script carregado com sucesso');
