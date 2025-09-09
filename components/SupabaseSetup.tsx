
import React, { useState } from 'react';
import { initializeSupabase, SQL_SNIPPET } from '../services/supabaseService';

interface SupabaseSetupProps {
  onConnected: () => void;
}

export const SupabaseSetup: React.FC<SupabaseSetupProps> = ({ onConnected }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!url || !anonKey) {
      setError("Por favor, preencha a URL e a Chave anônima.");
      setLoading(false);
      return;
    }
    try {
      initializeSupabase(url, anonKey);
      // A simple check to see if connection is valid
      await fetch(url, { headers: { apikey: anonKey }});
      onConnected();
    } catch (err) {
      setError("Falha ao conectar ao Supabase. Verifique suas credenciais e a política de segurança de linha (RLS).");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-lg bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Conectar ao Supabase</h1>
          <p className="text-slate-400 mt-2">
            Para usar o aplicativo, conecte-se ao seu projeto Supabase.
          </p>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label htmlFor="supabaseUrl" className="block text-sm font-medium text-slate-300">
              URL do Projeto
            </label>
            <input
              id="supabaseUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemplo.supabase.co"
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label htmlFor="supabaseKey" className="block text-sm font-medium text-slate-300">
              Chave anônima (public)
            </label>
            <input
              id="supabaseKey"
              type="text"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJI..."
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-800 disabled:bg-purple-800 disabled:cursor-not-allowed"
          >
            {loading ? 'Conectando...' : 'Conectar'}
          </button>
        </form>

        <div className="text-sm text-slate-400 space-y-2">
            <p>1. Vá para <strong className="text-slate-200">Configurações do Projeto {'>'} API</strong> no seu painel Supabase.</p>
            <p>2. Copie a <strong className="text-slate-200">URL</strong> e a chave <strong className="text-slate-200">anon public</strong> e cole acima.</p>
            <p>3. Se a tabela `tournaments` não existir, você precisa criá-la. <button onClick={() => setShowSql(!showSql)} className="text-purple-400 hover:underline"> {showSql ? 'Ocultar' : 'Mostrar'} script SQL</button></p>
        </div>

        {showSql && (
            <div className="mt-4">
                <p className="text-sm text-slate-400 mb-2">Execute isto no <strong className="text-slate-200">Editor SQL</strong> do seu projeto Supabase:</p>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-md text-xs overflow-x-auto">
                    <code>{SQL_SNIPPET.trim()}</code>
                </pre>
            </div>
        )}
      </div>
    </div>
  );
};
