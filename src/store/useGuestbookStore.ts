import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuestbookState {
    weddingId: string | null;
    side: '신랑측' | '신부측' | null;
    setWeddingInfo: (weddingId: string, side: '신랑측' | '신부측') => void;
    clearWeddingInfo: () => void;
}

export const useGuestbookStore = create<GuestbookState>()(
    persist(
        (set) => ({
            weddingId: null,
            side: null,
            setWeddingInfo: (weddingId, side) => set({ weddingId, side }),
            clearWeddingInfo: () => set({ weddingId: null, side: null }),
        }),
        {
            name: 'guestbook-store', // 로컬 스토리지에 저장될 키 이름
        }
    )
);
