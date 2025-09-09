
import React from 'react';
import { Tournament } from '../types';
import { TrophyIcon, UsersIcon, EditIcon, PlusCircleIcon } from './icons';

interface TournamentListProps {
  tournaments: Tournament[];
  onSelectTournament: (tournament: Tournament) => void;
  onNewTournament: () => void;
  isLoading: boolean;
}

const TournamentCard: React.FC<{ tournament: Tournament, onSelect: () => void }> = ({ tournament, onSelect }) => {
    const statusColor = tournament.status === 'completed' ? 'border-l-green-500' : 'border-l-blue-500';
    return (
        <div onClick={onSelect} className={`bg-slate-800 rounded-lg shadow-lg p-4 cursor-pointer hover:bg-slate-700/50 transition-colors border-l-4 ${statusColor}`}>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tournament.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {tournament.status === 'completed' ? 'Finalizado' : 'Ativo'}
                </span>
            </div>
            <div className="flex items-center text-slate-400 text-sm mt-3 gap-6">
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    <span>{tournament.participants.length} / {tournament.size}</span>
                </div>
                <div className="flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4" />
                    <span>{tournament.winner ? tournament.winner.name : 'A decidir'}</span>
                </div>
            </div>
             <p className="text-xs text-slate-500 mt-3">
                Criado em: {new Date(tournament.created_at).toLocaleDateString('pt-BR')}
            </p>
        </div>
    )
}

export const TournamentList: React.FC<TournamentListProps> = ({ tournaments, onSelectTournament, onNewTournament, isLoading }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Seus Torneios</h2>
        <button onClick={onNewTournament} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 flex items-center gap-2 transition-colors">
            <PlusCircleIcon className="w-5 h-5"/>
            <span>Novo Torneio</span>
        </button>
      </div>
      
      {isLoading ? (
        <p className="text-slate-400">Carregando torneios...</p>
      ) : tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} onSelect={() => onSelectTournament(t)} />
            ))}
        </div>
      ) : (
        <div className="text-center bg-slate-800 p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-white">Nenhum torneio encontrado</h3>
            <p className="text-slate-400 mt-2">Que tal criar um agora?</p>
            <button onClick={onNewTournament} className="mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                Criar seu primeiro torneio
            </button>
        </div>
      )}
    </div>
  );
};
