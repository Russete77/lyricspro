'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Verificar se está rodando no Electron
    const electronCheck = typeof window !== 'undefined' && !!(window as any).electron;
    setIsElectron(electronCheck);

    if (electronCheck) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadSettings() {
    try {
      const electron = (window as any).electron;
      const settings = await electron.settings.load();

      if (settings.openaiApiKey) {
        // Mascarar a API key para exibição
        const masked = settings.openaiApiKey.substring(0, 7) + '...' + settings.openaiApiKey.substring(settings.openaiApiKey.length - 4);
        setApiKey(masked);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!isElectron) {
      alert('Esta funcionalidade só está disponível no aplicativo desktop');
      return;
    }

    try {
      const electron = (window as any).electron;
      await electron.settings.saveApiKey(apiKey);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar API key:', error);
      alert('Erro ao salvar configurações');
    }
  }

  if (!isElectron) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Configurações</h1>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-300">
            Esta página está disponível apenas no aplicativo desktop.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Configurações</h1>
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Configurações</h1>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">API da OpenAI</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-2 text-sm text-gray-400">
            Sua API key é armazenada localmente e nunca é enviada para nossos servidores.
          </p>
        </div>

        <div className="mb-4">
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Obter API key da OpenAI →
          </a>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Salvar
        </button>

        {saved && (
          <p className="mt-4 text-sm text-green-400">
            ✓ Configurações salvas com sucesso!
          </p>
        )}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-400 mb-2">
          💡 Dica
        </h3>
        <p className="text-sm text-yellow-300">
          A transcrição usando a API da OpenAI custa aproximadamente $0.006 por minuto de áudio.
          Um arquivo de 1 hora custaria cerca de $0.36 (36 centavos de dólar).
        </p>
      </div>
    </div>
  );
}
