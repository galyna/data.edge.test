import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Match } from "@/types/match";
import { shallow } from "zustand/shallow";

interface MatchStore {
  selectedMatch: Match | null;
  setSelectedMatch: (match: Match | null) => void;
  isMatchDetailDialogOpen: boolean;
  setMatchDetailDialogOpen: (isOpen: boolean) => void;
  // Cache for frequently accessed data
  matchCache: Map<string, Match>;
  addToCache: (match: Match) => void;
  getFromCache: (matchId: string) => Match | undefined;
  clearCache: () => void;
}

// Cached initial state for SSR to avoid infinite loops
const initialState: MatchStore = {
  selectedMatch: null,
  setSelectedMatch: () => {},
  isMatchDetailDialogOpen: false,
  setMatchDetailDialogOpen: () => {},
  matchCache: new Map(),
  addToCache: () => {},
  getFromCache: () => undefined,
  clearCache: () => {},
};

export const useMatchStore = create<MatchStore>()(
  devtools(
    persist(
      (set, get) => ({
        selectedMatch: null,
        setSelectedMatch: (match) => {
          set({ selectedMatch: match }, false, "setSelectedMatch");
          // Add to cache when selected
          if (match) {
            get().addToCache(match);
          }
        },
        isMatchDetailDialogOpen: false,
        setMatchDetailDialogOpen: (isOpen) =>
          set({ isMatchDetailDialogOpen: isOpen }, false, "setMatchDetailDialogOpen"),
        
        // Cache management
        matchCache: new Map(),
        addToCache: (match) =>
          set(
            (state) => {
              const newCache = new Map(state.matchCache);
              newCache.set(match.id, match);
              // Limit cache size to 100 items
              if (newCache.size > 100) {
                const firstEntry = newCache.keys().next();
                if (!firstEntry.done && firstEntry.value) {
                  newCache.delete(firstEntry.value);
                }
              }
              return { matchCache: newCache };
            },
            false,
            "addToCache"
          ),
        getFromCache: (matchId) => get().matchCache.get(matchId),
        clearCache: () => set({ matchCache: new Map() }, false, "clearCache"),
      }),
      {
        name: "match-storage",
        // Only persist selected match, not cache
        partialize: (state) => ({
          selectedMatch: state.selectedMatch,
        }),
        // Skip hydration for Map to avoid SSR issues
        skipHydration: true,
      }
    ),
    { name: "MatchStore", enabled: process.env.NODE_ENV === "development" }
  )
);

// Cached server snapshots to avoid infinite loops in SSR
// These functions must return the same reference on every call
const getSelectedMatchServerSnapshot = () => initialState.selectedMatch;
const getDialogOpenServerSnapshot = () => initialState.isMatchDetailDialogOpen;

// Optimized selectors to prevent unnecessary re-renders
export const useSelectedMatch = (): Match | null =>
  useMatchStore((state) => state.selectedMatch);

export const useSetSelectedMatch = () =>
  useMatchStore((state) => state.setSelectedMatch);

export const useMatchDialogOpen = (): boolean =>
  useMatchStore((state) => state.isMatchDetailDialogOpen);

export const useSetMatchDialogOpen = () =>
  useMatchStore((state) => state.setMatchDetailDialogOpen);

// Compound selector for match detail page (gets multiple values at once)
// Using separate selectors to avoid SSR issues with compound selectors + getServerSnapshot
export const useMatchDetail = (): {
  match: Match | null;
  isOpen: boolean;
  setMatch: (match: Match | null) => void;
  setOpen: (isOpen: boolean) => void;
} => {
  const match = useSelectedMatch();
  const isOpen = useMatchDialogOpen();
  const setMatch = useSetSelectedMatch();
  const setOpen = useSetMatchDialogOpen();

  return {
    match,
    isOpen,
    setMatch,
    setOpen,
  };
};
