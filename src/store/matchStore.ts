import { create } from "zustand";
import { Match } from "@/types/match";

interface MatchStore {
  selectedMatch: Match | null;
  setSelectedMatch: (match: Match | null) => void;
  isMatchDetailDialogOpen: boolean;
  setMatchDetailDialogOpen: (isOpen: boolean) => void;
}

export const useMatchStore = create<MatchStore>((set) => ({
  selectedMatch: null,
  setSelectedMatch: (match) => set({ selectedMatch: match }),
  isMatchDetailDialogOpen: false,
  setMatchDetailDialogOpen: (isOpen) => set({ isMatchDetailDialogOpen: isOpen }),
}));
