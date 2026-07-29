import { create } from 'zustand';

interface QuotePrefillState {
  pickup: string;
  dropoff: string;
  note: string;
  active: boolean;
  setPrefill: (pickup: string, dropoff: string, note: string) => void;
  clearPrefill: () => void;
}

export const useQuotePrefill = create<QuotePrefillState>((set) => ({
  pickup: '',
  dropoff: '',
  note: '',
  active: false,
  setPrefill: (pickup, dropoff, note) => set({ pickup, dropoff, note, active: true }),
  clearPrefill: () => set({ pickup: '', dropoff: '', note: '', active: false }),
}));
