import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Envelope, InsertEnvelope } from '../types/database';
import { useGuestbookStore } from '../store/useGuestbookStore';

export const envelopeKeys = {
    all: ['envelopes'] as const,
    list: (weddingId: string, side: string) => [...envelopeKeys.all, weddingId, side] as const,
};

export function useEnvelopes() {
    const { weddingId, side } = useGuestbookStore(); // Zustand 등에서 가져온 전역 상태
    // React Query의 모든 캐시(저장소)를 관리하는 총괄 매니저
    const queryClient = useQueryClient();

    const queryKey = weddingId && side ? envelopeKeys.list(weddingId, side) : envelopeKeys.all;

    const { data: envelopes = [], isLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!weddingId || !side) return [];
            const { data, error } = await supabase
                .from('envelopes')
                .select('*')
                .eq('wedding_id', weddingId)
                .eq('side', side)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Envelope[]; // as 는 타입을 확인시켜주는 typeScript 의 문법으로 Type Assertion 이라고 합니다.
        },
        enabled: !!weddingId && !!side, //weddingId나 side가 아직 없을 때(예: 페이지 로딩 직후) 무의미하게 서버에 빈 요청을 보내는 것을 막아줍니다.
    });

    const addEnvelope = useMutation({
        mutationFn: async (newEnvelope: InsertEnvelope) => {
            const { data, error } = await supabase
                .from('envelopes')
                .insert(newEnvelope)
                .select()
                .single();

            if (error) throw error;
            return data as Envelope;
        },
        // 1. onMutate: 통신을 시작하기 직전에 실행됨 (화면 조작)
        onMutate: async (newEnvelope) => {
            // a. 혹시 진행 중인 옛날 요청이 있으면 취소해! (새 화면을 덮어쓰면 안 되니까)
            await queryClient.cancelQueries({ queryKey });

            // b. 서버 통신이 실패할 경우를 대비해, 지금 화면에 있는 '진짜 데이터'를 백업해둠
            const previousEnvelopes = queryClient.getQueryData<Envelope[]>(queryKey);

            // c. 화면(캐시)에 임시 데이터를 강제로 끼워 넣음 (이게 낙관적 업데이트!)
            queryClient.setQueryData<Envelope[]>(queryKey, (old) => {
                const optimisticEnv: Envelope = {
                    ...newEnvelope,
                    id: `temp-${Date.now()}`,
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                };
                // 기존 목록 맨 앞에 임시 데이터를 추가해서 화면을 즉시 그림
                return old ? [optimisticEnv, ...old] : [optimisticEnv];
            });

            // d. 백업해둔 데이터를 반환함 (에러 났을 때 쓰려고)
            return { previousEnvelopes };
        },

        // 2. onError: 통신이 실패했을 때 실행됨 (롤백)
        onError: (_err, _newEnvelope, context) => {
            // 아까 onMutate에서 리턴한 백업 데이터(context.previousEnvelopes)로 화면을 되돌림
            if (context?.previousEnvelopes) {
                queryClient.setQueryData(queryKey, context.previousEnvelopes);
            }
        },
        // 3. onSettled: 성공하든 실패하든 무조건 마지막에 실행됨 (동기화)
        onSettled: () => {
            // 가짜 ID로 그려진 화면을 진짜 데이터로 덮어쓰기 위해 서버에 최신 목록을 다시 요청함
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const deleteEnvelope = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('envelopes').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    const updateEnvelope = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertEnvelope> }) => {
            const { data, error } = await supabase
                .from('envelopes')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data as Envelope;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    return { envelopes, isLoading, addEnvelope, deleteEnvelope, updateEnvelope };
}
