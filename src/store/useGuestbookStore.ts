import { create } from 'zustand';

interface GuestbookState {
    weddingId: string | null;
    side: '신랑측' | '신부측' | null;
    setWeddingInfo: (weddingId: string, side: '신랑측' | '신부측') => void;
    clearWeddingInfo: () => void;
}

export const useGuestbookStore = create<GuestbookState>((set) => ({
    weddingId: null,
    side: null,
    setWeddingInfo: (weddingId, side) => set({ weddingId, side }),
    clearWeddingInfo: () => set({ weddingId: null, side: null }),
}));
