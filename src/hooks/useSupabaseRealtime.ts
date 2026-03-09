import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useGuestbookStore } from '../store/useGuestbookStore';
import { envelopeKeys } from './useEnvelopes';

export function useSupabaseRealtime() {
    const { weddingId, side } = useGuestbookStore();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!weddingId || !side) return;

        const channel = supabase
            .channel('envelopes-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'envelopes',
                    filter: `wedding_id=eq.${weddingId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: envelopeKeys.list(weddingId, side) });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [weddingId, side, queryClient]);
}
