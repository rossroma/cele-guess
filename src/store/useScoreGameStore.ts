import { create } from 'zustand';
import type { Celebrity, ScoreGamePhase, FeedbackType, ScoreRound } from '../types';
import { getScoreForAttempts, saveHighScore } from '../utils/scoreGame';

interface ScoreGameStore {
  phase: ScoreGamePhase;
  celebrities: Celebrity[];
  currentIndex: number;
  charPool: string[];
  usedPoolIndices: number[];
  selectedChars: string[];
  wrongAttempts: number;
  feedbackType: FeedbackType;
  rounds: ScoreRound[];
  totalScore: number;
  correctCount: number;
  isNewHighScore: boolean;

  initGame: (celebrities: Celebrity[], firstCharPool: string[]) => void;
  selectChar: (poolIndex: number) => void;
  clearForRetry: () => void;
  nextRound: (nextCharPool: string[]) => void;
  resetGame: () => void;
}

export const useScoreGameStore = create<ScoreGameStore>((set, get) => ({
  phase: 'idle',
  celebrities: [],
  currentIndex: 0,
  charPool: [],
  usedPoolIndices: [],
  selectedChars: [],
  wrongAttempts: 0,
  feedbackType: null,
  rounds: [],
  totalScore: 0,
  correctCount: 0,
  isNewHighScore: false,

  initGame: (celebrities, firstCharPool) =>
    set({
      phase: 'playing',
      celebrities,
      currentIndex: 0,
      charPool: firstCharPool,
      usedPoolIndices: [],
      selectedChars: [],
      wrongAttempts: 0,
      feedbackType: null,
      rounds: [],
      totalScore: 0,
      correctCount: 0,
      isNewHighScore: false,
    }),

  selectChar: (poolIndex) => {
    const state = get();
    if (state.phase !== 'playing') return;
    if (state.feedbackType !== null) return;
    if (state.usedPoolIndices.includes(poolIndex)) return;

    const char = state.charPool[poolIndex];
    const celebrity = state.celebrities[state.currentIndex];
    const newSelectedChars = [...state.selectedChars, char];
    const newUsedPoolIndices = [...state.usedPoolIndices, poolIndex];

    // 还没填满，继续等待
    if (newSelectedChars.length < celebrity.name.length) {
      set({ selectedChars: newSelectedChars, usedPoolIndices: newUsedPoolIndices });
      return;
    }

    // 填满后自动判断
    const isCorrect = newSelectedChars.join('') === celebrity.name;

    if (isCorrect) {
      const score = getScoreForAttempts(state.wrongAttempts, true);
      const newRound: ScoreRound = {
        celebrity,
        wrongAttempts: state.wrongAttempts,
        scoreEarned: score,
        isCorrect: true,
      };
      set({
        selectedChars: newSelectedChars,
        usedPoolIndices: newUsedPoolIndices,
        feedbackType: 'correct',
        phase: 'roundEnd',
        rounds: [...state.rounds, newRound],
        totalScore: state.totalScore + score,
        correctCount: state.correctCount + 1,
      });
    } else {
      const newWrongAttempts = state.wrongAttempts + 1;

      if (newWrongAttempts >= 2) {
        // 两次都错，揭示答案
        const newRound: ScoreRound = {
          celebrity,
          wrongAttempts: newWrongAttempts,
          scoreEarned: 0,
          isCorrect: false,
        };
        set({
          selectedChars: newSelectedChars,
          usedPoolIndices: newUsedPoolIndices,
          feedbackType: 'wrong-revealed',
          phase: 'roundEnd',
          rounds: [...state.rounds, newRound],
          wrongAttempts: newWrongAttempts,
        });
      } else {
        // 第一次错，抖动后允许重试
        set({
          selectedChars: newSelectedChars,
          usedPoolIndices: newUsedPoolIndices,
          feedbackType: 'wrong-retry',
          wrongAttempts: newWrongAttempts,
        });
      }
    }
  },

  clearForRetry: () =>
    set({
      selectedChars: [],
      usedPoolIndices: [],
      feedbackType: null,
    }),

  nextRound: (nextCharPool) => {
    const state = get();
    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= state.celebrities.length) {
      const isNew = saveHighScore(state.totalScore);
      set({ phase: 'gameEnd', isNewHighScore: isNew });
    } else {
      set({
        phase: 'playing',
        currentIndex: nextIndex,
        charPool: nextCharPool,
        usedPoolIndices: [],
        selectedChars: [],
        wrongAttempts: 0,
        feedbackType: null,
      });
    }
  },

  resetGame: () =>
    set({
      phase: 'idle',
      celebrities: [],
      currentIndex: 0,
      charPool: [],
      usedPoolIndices: [],
      selectedChars: [],
      wrongAttempts: 0,
      feedbackType: null,
      rounds: [],
      totalScore: 0,
      correctCount: 0,
      isNewHighScore: false,
    }),
}));
