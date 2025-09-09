import { Tournament } from '../types';

const TOURNAMENTS_KEY = 'tournamentsApp.tournaments';

const getStoredTournaments = (): Tournament[] => {
  try {
    const stored = localStorage.getItem(TOURNAMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Erro ao ler torneios do localStorage:", error);
    return [];
  }
};

const saveStoredTournaments = (tournaments: Tournament[]) => {
  try {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
  } catch (error) {
    console.error("Erro ao salvar torneios no localStorage:", error);
  }
};

// As funções abaixo simulam a natureza assíncrona da API original.
export const createTournament = async (tournamentData: Omit<Tournament, 'id' | 'created_at'>): Promise<Tournament> => {
  return new Promise((resolve) => {
    const tournaments = getStoredTournaments();
    const newTournament: Tournament = {
      ...tournamentData,
      id: self.crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    tournaments.unshift(newTournament); // Adiciona ao início da lista
    saveStoredTournaments(tournaments);
    resolve(newTournament);
  });
};

export const getTournaments = async (): Promise<Tournament[]> => {
  return new Promise((resolve) => {
    const tournaments = getStoredTournaments();
    // Ordena por data de criação, decrescente, como no serviço original
    tournaments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    resolve(tournaments);
  });
};

export const updateTournament = async (id: string, updates: Partial<Tournament>): Promise<Tournament> => {
  return new Promise((resolve, reject) => {
    const tournaments = getStoredTournaments();
    const tournamentIndex = tournaments.findIndex(t => t.id === id);
    if (tournamentIndex === -1) {
      return reject(new Error("Torneio não encontrado."));
    }
    const updatedTournament = { ...tournaments[tournamentIndex], ...updates };
    tournaments[tournamentIndex] = updatedTournament;
    saveStoredTournaments(tournaments);
    resolve(updatedTournament);
  });
};

export const deleteTournament = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    let tournaments = getStoredTournaments();
    tournaments = tournaments.filter(t => t.id !== id);
    saveStoredTournaments(tournaments);
    resolve();
  });
};

// FIX: Add missing exports 'initializeSupabase' and 'SQL_SNIPPET' to fix import errors.
// These are placeholders as the application currently uses localStorage.
export const initializeSupabase = (url: string, anonKey: string): void => {
  // Esta função é um placeholder. A implementação atual usa localStorage
  // e não se conecta ao Supabase. Adicionado para resolver erros de compilação.
  console.log("Tentativa de inicializar o Supabase (mock). URL:", url);
};

export const SQL_SNIPPET = `
-- Script para criar a tabela de torneios no Supabase.
-- Execute isso no Editor SQL do seu projeto.

CREATE TABLE public.tournaments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  size smallint NOT NULL,
  participants jsonb NOT NULL,
  matches jsonb NOT NULL,
  status text NOT NULL,
  winner jsonb NULL,
  CONSTRAINT tournaments_pkey PRIMARY KEY (id)
);

-- Ativar a Segurança em Nível de Linha (RLS) para a tabela.
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- As políticas abaixo são exemplos. Adapte-as às suas regras de autorização.
-- Permite que qualquer pessoa leia os torneios.
CREATE POLICY "Public tournaments are viewable by everyone."
ON public.tournaments FOR SELECT
USING (true);

-- Permite que usuários autenticados (ou qualquer pessoa, dependendo da sua configuração) criem torneios.
CREATE POLICY "Anyone can create tournaments."
ON public.tournaments FOR INSERT
WITH CHECK (true);

-- Permite que os usuários atualizem os torneios.
-- Em um aplicativo real, você restringiria isso ao criador do torneio.
CREATE POLICY "Anyone can update tournaments."
ON public.tournaments FOR UPDATE
USING (true);

-- Permite que os usuários excluam os torneios.
-- Em um aplicativo real, você restringiria isso ao criador do torneio.
CREATE POLICY "Anyone can delete tournaments."
ON public.tournaments FOR DELETE
USING (true);
`;
