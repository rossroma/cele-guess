import { create } from 'zustand';
import type { Celebrity } from '../types';

interface GameState {
  currentCelebrity: Celebrity | null;
  isAnswerVisible: boolean;
  viewedCount: number;
  history: Celebrity[];
  currentIndex: number;
  setCurrentCelebrity: (celebrity: Celebrity | null) => void;
  showAnswer: () => void;
  hideAnswer: () => void;
  incrementViewedCount: () => void;
  addToHistory: (celebrity: Celebrity) => void;
  goNext: () => boolean; // 返回是否需要加载新的随机明星
  goPrevious: () => boolean; // 返回是否成功返回上一张
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentCelebrity: null,
  isAnswerVisible: false,
  viewedCount: 0,
  history: [],
  currentIndex: -1,

  setCurrentCelebrity: (celebrity) =>
    set({ currentCelebrity: celebrity, isAnswerVisible: false }),

  showAnswer: () => set({ isAnswerVisible: true }),

  hideAnswer: () => set({ isAnswerVisible: false }),

  incrementViewedCount: () =>
    set((state) => ({ viewedCount: state.viewedCount + 1 })),

  addToHistory: (celebrity) => {
    const state = get();
    const newHistory = [...state.history.slice(0, state.currentIndex + 1), celebrity];
    set({
      history: newHistory,
      currentIndex: newHistory.length - 1,
      currentCelebrity: celebrity,
      isAnswerVisible: false
    });
  },

  goNext: () => {
    const state = get();
    if (state.currentIndex < state.history.length - 1) {
      // 历史记录中有下一张
      const nextIndex = state.currentIndex + 1;
      set({
        currentIndex: nextIndex,
        currentCelebrity: state.history[nextIndex],
        isAnswerVisible: false
      });
      return false; // 不需要加载新的
    }
    // 已经是最后一张，需要加载新的
    return true;
  },

  goPrevious: () => {
    const state = get();
    if (state.currentIndex > 0) {
      const prevIndex = state.currentIndex - 1;
      set({
        currentIndex: prevIndex,
        currentCelebrity: state.history[prevIndex],
        isAnswerVisible: false
      });
      return true; // 成功返回上一张
    }
    return false; // 已经是第一张
  },

  resetGame: () =>
    set({ 
      currentCelebrity: null, 
      isAnswerVisible: false, 
      viewedCount: 0,
      history: [],
      currentIndex: -1
    })
}));
