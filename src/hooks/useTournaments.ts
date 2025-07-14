import { useState, useEffect } from 'react';
import { Tournament } from '../types';
import { supabase } from '../lib/supabase';

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tournaments:', error);
          setTournaments([]);
        } else {
          setTournaments(data || []);
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const joinTournament = async (tournamentId: string) => {
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        console.error('Error joining tournament:', error);
        return;
      }

      // Refresh tournaments list
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      
      setTournaments(data || []);
    } catch (error) {
      console.error('Error joining tournament:', error);
    }
  };

  return { tournaments, loading, joinTournament };
};