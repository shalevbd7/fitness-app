import { create } from "zustand";

export const useUIStore = create((set) => ({
  fabAction: null,
  setFabAction: (action) => set({ fabAction: action }),

  resetFabAction: () => set({ fabAction: null }),
}));
