
export interface Participant {
  id: number;
  name: string;
  avatar?: string;
}

export interface Match {
  id: number;
  round: number;
  matchInRound: number;
  participant1Id: number | null;
  participant2Id: number | null;
  winnerId: number | null;
  nextMatchId: number | null;
}

export interface Tournament {
  id: string; // uuid
  name: string;
  size: 8 | 16 | 32;
  participants: Participant[];
  matches: Match[];
  status: 'configuring' | 'active' | 'completed';
  winner: Participant | null;
  created_at: string;
}
