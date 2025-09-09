
import React, { useState } from 'react';
import { Match, Participant, Tournament } from '../types';
import { createTournament } from '../services/supabaseService';
import { ChevronLeftIcon } from './icons';

interface TournamentCreatorProps {
  onTournamentCreated: (tournament: Tournament) => void;
  onBack: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateMatches = (participants: Participant[], size: 8 | 16 | 32): Match[] => {
    const shuffledParticipants = shuffleArray(participants);
    const matches: Match[] = [];
    let matchIdCounter = 0;
    let currentRoundMatches: Match[] = [];
  
    // Round 1
    for (let i = 0; i < size / 2; i++) {
      const p1 = shuffledParticipants[i * 2] || null;
      const p2 = shuffledParticipants[i * 2 + 1] || null;
      
      const match: Match = {
        id: matchIdCounter++,
        round: 1,
        matchInRound: i,
        participant1Id: p1 ? p1.id : null,
        participant2Id: p2 ? p2.id : null,
        winnerId: p1 && !p2 ? p1.id : (!p1 && p2 ? p2.id : null), // Handle byes
        nextMatchId: null
      };
      currentRoundMatches.push(match);
    }
  
    matches.push(...currentRoundMatches);
  
    let round = 2;
    let matchesInRound = size / 4;
  
    while (matchesInRound >= 1) {
      const nextRoundMatches: Match[] = [];
      for (let i = 0; i < matchesInRound; i++) {
        const match: Match = {
          id: matchIdCounter++,
          round,
          matchInRound: i,
          participant1Id: null,
          participant2Id: null,
          winnerId: null,
          nextMatchId: null,
        };
        
        // Link previous round matches to this new match
        const prevMatch1 = currentRoundMatches[i * 2];
        const prevMatch2 = currentRoundMatches[i * 2 + 1];
        if(prevMatch1) prevMatch1.nextMatchId = match.id;
        if(prevMatch2) prevMatch2.nextMatchId = match.id;
        
        nextRoundMatches.push(match);
      }
      matches.push(...nextRoundMatches);
      currentRoundMatches = nextRoundMatches;
      matchesInRound /= 2;
      round++;
    }
  
    return matches;
  };

export const TournamentCreator: React.FC<TournamentCreatorProps> = ({ onTournamentCreated, onBack }) => {
  const [name, setName] = useState('');
  const [size, setSize] = useState<8 | 16 | 32>(8);
  const [participantsText, setParticipantsText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const participantNames = participantsText.split('\n').map(p => p.trim()).filter(Boolean);
    if (participantNames.length < 2) {
      setError('São necessários pelo menos 2 participantes.');
      setLoading(false);
      return;
    }
    if (participantNames.length > size) {
        setError(`O número de participantes (${participantNames.length}) excede o tamanho do torneio (${size}).`);
        setLoading(false);
        return;
    }

    const participants: Participant[] = participantNames.map((name, index) => ({ id: index + 1, name }));

    const matches = generateMatches(participants, size);
    
    // Auto advance winners for bye matches in the generated structure
    matches.forEach(match => {
        if(match.winnerId && match.nextMatchId !== null) {
            const nextMatch = matches.find(m => m.id === match.nextMatchId);
            if (nextMatch) {
                if (nextMatch.participant1Id === null) {
                    nextMatch.participant1Id = match.winnerId;
                } else if (nextMatch.participant2Id === null) {
                    nextMatch.participant2Id = match.winnerId;
                }
            }
        }
    });

    try {
      const newTournament = await createTournament({
        name,
        size,
        participants,
        matches,
        status: 'active',
        winner: null,
      });
      onTournamentCreated(newTournament);
    } catch (err: any) {
      setError(`Erro ao criar torneio: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
            <ChevronLeftIcon className="w-5 h-5" /> Voltar para a lista
        </button>
        <h2 className="text-3xl font-bold mb-6 text-white">Criar Novo Torneio</h2>
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-xl space-y-6">
            <div>
                <label htmlFor="t-name" className="block text-sm font-medium text-slate-300">Nome do Torneio</label>
                <input id="t-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"/>
            </div>
            <div>
                <label htmlFor="t-size" className="block text-sm font-medium text-slate-300">Número de Participantes</label>
                <select id="t-size" value={size} onChange={e => setSize(Number(e.target.value) as 8 | 16 | 32)} className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500">
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                </select>
            </div>
            <div>
                <label htmlFor="t-participants" className="block text-sm font-medium text-slate-300">Participantes (um por linha)</label>
                <textarea id="t-participants" value={participantsText} onChange={e => setParticipantsText(e.target.value)} required rows={size / 2} placeholder="Participante 1&#10;Participante 2&#10;..." className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"></textarea>
                <p className="text-xs text-slate-400 mt-1">{participantsText.split('\n').filter(Boolean).length} / {size} participantes</p>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-purple-800 transition-colors">
                {loading ? 'Criando...' : 'Gerar Chaveamento'}
            </button>
        </form>
    </div>
  );
};
