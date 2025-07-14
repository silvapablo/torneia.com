/*
  # Create tournaments and tournament_participants tables

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `name` (text, tournament name)
      - `game_type` (text, 'chess' or 'buraco')
      - `buy_in` (numeric, entry fee)
      - `prize_pool` (numeric, total prize money)
      - `current_players` (integer, current participant count)
      - `max_players` (integer, maximum participants)
      - `status` (text, 'waiting', 'active', or 'finished')
      - `start_time` (timestamptz, tournament start)
      - `end_time` (timestamptz, tournament end, nullable)
      - `type` (text, 'blitz', 'rapid', or 'elite')
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

    - `tournament_participants`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key to tournaments)
      - `user_id` (uuid, foreign key to auth.users)
      - `joined_at` (timestamptz, participation timestamp)

  2. Security
    - Enable RLS on both tables
    - Public can read tournaments
    - Only authenticated users can join tournaments
    - Only admins can create/modify tournaments
*/

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  game_type text NOT NULL CHECK (game_type IN ('chess', 'buraco')),
  buy_in numeric NOT NULL DEFAULT 0,
  prize_pool numeric NOT NULL DEFAULT 0,
  current_players integer NOT NULL DEFAULT 0,
  max_players integer NOT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  type text NOT NULL CHECK (type IN ('blitz', 'rapid', 'elite')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tournament_participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view tournaments"
  ON tournaments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can create tournaments"
  ON tournaments
  FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can update tournaments"
  ON tournaments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- RLS Policies for tournament_participants
CREATE POLICY "Anyone can view tournament participants"
  ON tournament_participants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can join tournaments"
  ON tournament_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave tournaments"
  ON tournament_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update current_players count
CREATE OR REPLACE FUNCTION update_tournament_players()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tournaments 
    SET current_players = current_players + 1,
        updated_at = now()
    WHERE id = NEW.tournament_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tournaments 
    SET current_players = current_players - 1,
        updated_at = now()
    WHERE id = OLD.tournament_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update current_players
CREATE TRIGGER tournament_participants_count_trigger
  AFTER INSERT OR DELETE ON tournament_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_players();

-- Trigger to update updated_at on tournaments
CREATE TRIGGER tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();