import React, { useState, useEffect, useCallback } from 'react';
import { getTournaments } from './services/supabaseService';
import { Tournament } from './types';
import { TournamentList } from './components/TournamentList';
import { TournamentCreator } from './components/TournamentCreator';
import { TournamentBracket } from './components/TournamentBracket';
import { TrophyIcon } from './components/icons';

type View = 'list' | 'create' | 'bracket';

function App() {
  const [view, setView] = useState<View>('list');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTournaments();
      setTournaments(data);
    } catch (error) {
      console.error("Falha ao buscar torneios:", error);
      alert("Não foi possível carregar os torneios do armazenamento local.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleTournamentCreated = (tournament: Tournament) => {
    setTournaments([tournament, ...tournaments]);
    setSelectedTournament(tournament);
    setView('bracket');
  };
  
  const handleTournamentSelected = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setView('bracket');
  };

  const handleBackToList = () => {
    setSelectedTournament(null);
    setView('list');
    fetchTournaments(); // Atualiza a lista ao voltar
  };

  const handleTournamentDeleted = (id: string) => {
    setTournaments(tournaments.filter(t => t.id !== id));
    handleBackToList();
  }

  const handleTournamentUpdated = (updatedTournament: Tournament) => {
    setSelectedTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === updatedTournament.id ? updatedTournament : t));
  };

  const renderContent = () => {
    switch (view) {
      case 'create':
        return <TournamentCreator onTournamentCreated={handleTournamentCreated} onBack={handleBackToList} />;
      case 'bracket':
        if (selectedTournament) {
          return <TournamentBracket 
                    tournament={selectedTournament} 
                    onBack={handleBackToList} 
                    onTournamentDeleted={handleTournamentDeleted}
                    onTournamentUpdated={handleTournamentUpdated}
                  />;
        }
        return null; // Não deve acontecer
      case 'list':
      default:
        return <TournamentList 
                tournaments={tournaments} 
                onSelectTournament={handleTournamentSelected} 
                onNewTournament={() => setView('create')} 
                isLoading={isLoading} 
               />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
       <header className="bg-slate-800/50 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
               <TrophyIcon className="w-8 h-8 text-purple-400"/>
              <h1 className="text-xl font-bold">Gerador de Chaves</h1>
            </div>
          </div>
        </div>
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
