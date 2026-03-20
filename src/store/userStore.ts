import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  username?: string | null;
  title?: string | null;
  ring?: string | null;
}

interface UserState {
  user: (User & UserProfile) | null;
  isLoading: boolean;
  setUser: (user: (User & UserProfile) | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearUser: () => set({ user: null }),
}));
