import { create } from 'zustand';
import type { User, Plan } from '@/lib/db/schema/users';

interface UserStore {
  user: User | null;
  plan: Plan | null;
  setUser: (user: User | null) => void;
  setPlan: (plan: Plan | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  plan: null,
  setUser: (user) => set({ user }),
  setPlan: (plan) => set({ plan }),
  clearUser: () => set({ user: null, plan: null }),
}));