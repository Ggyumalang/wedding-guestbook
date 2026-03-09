import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Wedding, InsertWedding } from '../types/database';

export const weddingKeys = {
  all: ['weddings'] as const,
};

export function useWeddings() {
  const queryClient = useQueryClient();

  const { data: weddings = [], isLoading } = useQuery({
    queryKey: weddingKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Wedding[];
    },
  });

  const createWedding = useMutation({
    mutationFn: async (newWedding: InsertWedding) => {
      const { data, error } = await supabase
        .from('weddings')
        .insert(newWedding)
        .select()
        .single();
        
      if (error) throw error;
      return data as Wedding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weddingKeys.all });
    },
  });

  return { weddings, isLoading, createWedding };
}
