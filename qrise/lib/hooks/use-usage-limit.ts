'use client';

import { create } from 'zustand';

interface UsageLimitState {
  isOpen: boolean;
  plan: string;
  canEnableOverages: boolean;
  openModal: (plan: string, canEnableOverages: boolean) => void;
  closeModal: () => void;
}

export const useUsageLimit = create<UsageLimitState>((set) => ({
  isOpen: false,
  plan: 'free',
  canEnableOverages: false,
  openModal: (plan, canEnableOverages) => set({ isOpen: true, plan, canEnableOverages }),
  closeModal: () => set({ isOpen: false }),
}));
