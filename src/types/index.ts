// User and Profile types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  cpf: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  balance: number;
  chess_rating: number;
  buraco_rating: number;
  subscription: 'free' | 'premium' | 'vip';
  is_admin: boolean;
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Tournament types
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  game_type: 'chess' | 'buraco';
  type: 'elimination' | 'round_robin' | 'swiss';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  max_players: number;
  current_players: number;
  entry_fee: number;
  prize_pool: number;
  start_date: string;
  end_date?: string;
  registration_deadline: string;
  rules?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  joined_at: string;
  status: 'registered' | 'confirmed' | 'eliminated' | 'winner';
}