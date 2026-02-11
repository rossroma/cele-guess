import { create } from 'zustand';
import type { Celebrity } from '../types';

interface GameState {
  currentCelebrity: Celebrity | null;
  isAnswerVisible: boolean;
  viewedCount: number;
  setCurrentCelebrity: (celebrity: Celebrity | null) => void;
  showAnswer: () => void;
  hideAnswer: () => void;
  incrementViewedCount: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentCelebrity: null,
  isAnswerVisible: false,
  viewedCount: 0,

  setCurrentCelebrity: (celebrity) =>
    set({ currentCelebrity: celebrity, isAnswerVisible: false }),

  showAnswer: () => set({ isAnswerVisible: true }),

  hideAnswer: () => set({ isAnswerVisible: false }),

  incrementViewedCount: () =>
    set((state) => ({ viewedCount: state.viewedCount + 1 })),

  resetGame: () =>
    set({ currentCelebrity: null, isAnswerVisible: false, viewedCount: 0 })
}));
