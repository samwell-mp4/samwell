import React, { useState, useMemo } from 'react';
import { Tournament, Participant, Match } from '../types';
import { updateTournament, deleteTournament } from '../services/supabaseService';
import { ChevronLeftIcon, TrashIcon, TrophyIcon } from './icons';

interface TournamentBracketProps {
  tournament: Tournament;
  onBack: () => void;
  onTournamentDeleted: (id: string) => void;
  onTournamentUpdated: (tournament: Tournament) => void;
}

const ParticipantDisplay: React.FC<{ participant: Participant | undefined | null, isWinner: boolean, onSelect: () => void, isClickable: boolean }> = ({ participant, isWinner, onSelect, isClickable }) => {
    const clickableClasses = isClickable ? "cursor-pointer hover:bg-purple-700" : "cursor-default";

    const boxClasses = [
        'flex items-center p-2 rounded-md w-full',
        'transition-colors duration-500 ease-in-out',
        clickableClasses,
        isWinner ? 'bg-purple-900/50' : ''
    ].join(' ');

    // Classes de transição e estilo para o texto do participante
    const textClasses = [
        'block w-full', // block para aplicar transform, w-full para ocupar espaço
        'transition-all duration-500 ease-out',
        // Estilo para destacar o vencedor na partida atual
        isWinner ? 'font-bold text-yellow-300' : '',
        // Estilos de estado para animar o avanço do participante para a próxima rodada
        !participant
            ? 'text-slate-400 italic opacity-70 -translate-x-3' // Estado inicial para 'A definir': semi-transparente e deslocado
            : 'opacity-100 translate-x-0' // Estado final para o nome do participante: opaco e na posição correta
    ].join(' ');

    return (
        <div 
            onClick={isClickable ? onSelect : undefined}
            className={boxClasses}
        >
            {/* O wrapper com overflow-hidden é importante para "cortar" o texto enquanto ele desliza para dentro, criando um efeito limpo */}
            <div className="overflow-hidden">
                <span className={textClasses}>
                    {participant ? participant.name : 'A definir'}
                </span>
            </div>
        </div>
    );
};


export const TournamentBracket: React.FC<TournamentBracketProps> = ({ tournament, onBack, onTournamentDeleted, onTournamentUpdated }) => {
  const [localTournament, setLocalTournament] = useState<Tournament>(tournament);
  const [isDeleting, setIsDeleting] = useState(false);

  const getParticipant = (id: number | null): Participant | undefined => {
      if (id === null) return undefined;
      return localTournament.participants.find(p => p.id === id);
  };
  
  const handleSelectWinner = async (match: Match, winnerId: number) => {
    if (match.winnerId || localTournament.status === 'completed') return;

    const updatedMatches = [...localTournament.matches];
    const currentMatch = updatedMatches.find(m => m.id === match.id);
    if (!currentMatch) return;

    currentMatch.winnerId = winnerId;

    if (currentMatch.nextMatchId !== null) {
      const nextMatch = updatedMatches.find(m => m.id === currentMatch.nextMatchId);
      if (nextMatch) {
        if (nextMatch.participant1Id === null) {
          nextMatch.participant1Id = winnerId;
        } else if (nextMatch.participant2Id === null) {
          nextMatch.participant2Id = winnerId;
        }
      }
    }

    // Fix: Explicitly type `updatedStatus` to prevent incorrect type narrowing from the guard clause above.
    let updatedStatus: Tournament['status'] = localTournament.status;
    let finalWinner = localTournament.winner;

    if (currentMatch.nextMatchId === null) { // Final match
        updatedStatus = 'completed';
        finalWinner = getParticipant(winnerId) || null;
    }

    const updatedTournament: Tournament = { 
        ...localTournament, 
        matches: updatedMatches,
        status: updatedStatus,
        winner: finalWinner,
    };
    
    setLocalTournament(updatedTournament);
    onTournamentUpdated(updatedTournament);
    
    try {
      await updateTournament(localTournament.id, { 
        matches: updatedMatches,
        status: updatedStatus,
        winner: finalWinner
      });
    } catch (error) {
      console.error("Failed to update tournament:", error);
      // Optionally revert state
      setLocalTournament(tournament); 
      onTournamentUpdated(tournament);
    }
  };

  const handleDelete = async () => {
      if(window.confirm(`Tem certeza que deseja excluir o torneio "${localTournament.name}"?`)) {
          setIsDeleting(true);
          try {
              await deleteTournament(localTournament.id);
              onTournamentDeleted(localTournament.id);
          } catch(err) {
              console.error("Erro ao excluir torneio", err);
              alert("Não foi possível excluir o torneio.");
          } finally {
              setIsDeleting(false);
          }
      }
  }

  const rounds = useMemo(() => {
    const roundMap: { [key: number]: Match[] } = {};
    localTournament.matches.forEach(match => {
      if (!roundMap[match.round]) {
        roundMap[match.round] = [];
      }
      roundMap[match.round].push(match);
    });
    return Object.values(roundMap).map(matches => matches.sort((a, b) => a.matchInRound - b.matchInRound));
  }, [localTournament.matches]);


  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-2">
                <ChevronLeftIcon className="w-5 h-5" /> Voltar para a lista
            </button>
            <h2 className="text-3xl font-bold text-white">{localTournament.name}</h2>
            <p className="text-slate-400">{localTournament.participants.length} Participantes</p>
        </div>
        <div>
            <button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
                <TrashIcon className="w-4 h-4" />
                {isDeleting ? 'Excluindo...' : 'Excluir Torneio'}
            </button>
        </div>
      </div>

      {localTournament.status === 'completed' && localTournament.winner && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl mb-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold">Campeão!</h3>
          <div className="flex items-center justify-center gap-4 mt-2">
            <TrophyIcon className="w-10 h-10 text-yellow-300" />
            <p className="text-4xl font-extrabold">{localTournament.winner.name}</p>
            <TrophyIcon className="w-10 h-10 text-yellow-300" />
          </div>
        </div>
      )}

      <div className="flex overflow-x-auto space-x-4 md:space-x-8 pb-4">
        {rounds.map((matches, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-around space-y-4 min-w-[250px]">
            <h3 className="text-xl font-semibold text-center text-slate-300 mb-4">
              {roundIndex + 1 === rounds.length ? 'Final' : `Rodada ${roundIndex + 1}`}
            </h3>
            {matches.map((match) => {
              const p1 = getParticipant(match.participant1Id);
              const p2 = getParticipant(match.participant2Id);
              const canSelect = p1 && p2 && !match.winnerId && localTournament.status !== 'completed';

              return (
                <div key={match.id} className="bg-slate-800 rounded-lg p-3 shadow-md">
                    <div className="flex flex-col divide-y divide-slate-700">
                        <ParticipantDisplay 
                            participant={p1} 
                            isWinner={match.winnerId === p1?.id}
                            onSelect={() => handleSelectWinner(match, p1!.id)}
                            isClickable={!!canSelect}
                        />
                         <ParticipantDisplay 
                            participant={p2} 
                            isWinner={match.winnerId === p2?.id}
                            onSelect={() => handleSelectWinner(match, p2!.id)}
                            isClickable={!!canSelect}
                        />
                    </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};