import { create } from 'zustand';

export interface GamificationData {
  xp: number;
  level: number;
  streak_count: number;
  last_active_date: string | null;
}

interface GamificationState {
  data: GamificationData | null;
  isLoading: boolean;
  setData: (data: GamificationData) => void;
  setLoading: (loading: boolean) => void;
  addXP: (amount: number) => void;
}

const XP_PER_LEVEL = 100; // simple level progression

export const useGamificationStore = create<GamificationState>((set) => ({
  data: null,
  isLoading: true,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ isLoading: loading }),
  addXP: (amount) =>
    set((state) => {
      if (!state.data) return state;
      const newXP = state.data.xp + amount;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      return {
        data: {
          ...state.data,
          xp: newXP,
          level: newLevel,
        },
      };
    }),
}));
