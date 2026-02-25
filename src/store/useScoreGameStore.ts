import { create } from 'zustand';
import type { Celebrity, ScoreGamePhase, FeedbackType, ScoreRound } from '../types';
import { getScoreForAttempts, saveHighScore } from '../utils/scoreGame';

const emptySlots = (len: number): string[] => Array(len).fill('');
const emptyIndices = (len: number): (number | null)[] => Array(len).fill(null);

interface ScoreGameStore {
  phase: ScoreGamePhase;
  celebrities: Celebrity[];
  currentIndex: number;
  charPool: string[];
  /** 每个方格当前填入的字，'' 表示空 */
  slots: string[];
  /** 每个方格对应的字符池下标，null 表示空 */
  slotPoolIndices: (number | null)[];
  /** 当前被"瞄准"待替换的方格下标，null 表示无 */
  targetSlotIndex: number | null;
  wrongAttempts: number;
  feedbackType: FeedbackType;
  rounds: ScoreRound[];
  totalScore: number;
  correctCount: number;
  isNewHighScore: boolean;

  initGame: (celebrities: Celebrity[], firstCharPool: string[]) => void;
  selectChar: (poolIndex: number) => void;
  setTargetSlot: (slotIndex: number) => void;
  clearForRetry: () => void;
  nextRound: (nextCharPool: string[]) => void;
  resetGame: () => void;
}

export const useScoreGameStore = create<ScoreGameStore>((set, get) => ({
  phase: 'idle',
  celebrities: [],
  currentIndex: 0,
  charPool: [],
  slots: [],
  slotPoolIndices: [],
  targetSlotIndex: null,
  wrongAttempts: 0,
  feedbackType: null,
  rounds: [],
  totalScore: 0,
  correctCount: 0,
  isNewHighScore: false,

  initGame: (celebrities, firstCharPool) => {
    const len = celebrities[0].name.length;
    set({
      phase: 'playing',
      celebrities,
      currentIndex: 0,
      charPool: firstCharPool,
      slots: emptySlots(len),
      slotPoolIndices: emptyIndices(len),
      targetSlotIndex: null,
      wrongAttempts: 0,
      feedbackType: null,
      rounds: [],
      totalScore: 0,
      correctCount: 0,
      isNewHighScore: false,
    });
  },

  selectChar: (poolIndex) => {
    const state = get();
    if (state.phase !== 'playing') return;
    if (state.feedbackType !== null) return;

    // 计算哪些池位置已被占用（排除当前瞄准槽，它可被替换）
    const occupiedIndices = state.slotPoolIndices
      .filter((idx, slotIdx): idx is number =>
        idx !== null && slotIdx !== state.targetSlotIndex
      );
    if (occupiedIndices.includes(poolIndex)) return;

    const char = state.charPool[poolIndex];
    const celebrity = state.celebrities[state.currentIndex];
    const newSlots = [...state.slots];
    const newSlotPoolIndices = [...state.slotPoolIndices];

    if (state.targetSlotIndex !== null) {
      // 替换被瞄准的方格
      newSlots[state.targetSlotIndex] = char;
      newSlotPoolIndices[state.targetSlotIndex] = poolIndex;
    } else {
      // 填入下一个空格
      const nextEmpty = newSlots.findIndex((s) => s === '');
      if (nextEmpty === -1) return;
      newSlots[nextEmpty] = char;
      newSlotPoolIndices[nextEmpty] = poolIndex;
    }

    const allFilled = newSlots.every((s) => s !== '');

    if (!allFilled) {
      set({ slots: newSlots, slotPoolIndices: newSlotPoolIndices, targetSlotIndex: null });
      return;
    }

    // 全部填满 → 自动判断
    const isCorrect = newSlots.join('') === celebrity.name;

    if (isCorrect) {
      const score = getScoreForAttempts(state.wrongAttempts, true);
      set({
        slots: newSlots,
        slotPoolIndices: newSlotPoolIndices,
        targetSlotIndex: null,
        feedbackType: 'correct',
        phase: 'roundEnd',
        rounds: [
          ...state.rounds,
          { celebrity, wrongAttempts: state.wrongAttempts, scoreEarned: score, isCorrect: true },
        ],
        totalScore: state.totalScore + score,
        correctCount: state.correctCount + 1,
      });
    } else {
      const newWrongAttempts = state.wrongAttempts + 1;
      if (newWrongAttempts >= 2) {
        // 两次都错，揭示答案
        set({
          slots: newSlots,
          slotPoolIndices: newSlotPoolIndices,
          targetSlotIndex: null,
          feedbackType: 'wrong-revealed',
          phase: 'roundEnd',
          wrongAttempts: newWrongAttempts,
          rounds: [
            ...state.rounds,
            { celebrity, wrongAttempts: newWrongAttempts, scoreEarned: 0, isCorrect: false },
          ],
        });
      } else {
        // 第一次错，抖动后可重试
        set({
          slots: newSlots,
          slotPoolIndices: newSlotPoolIndices,
          targetSlotIndex: null,
          feedbackType: 'wrong-retry',
          wrongAttempts: newWrongAttempts,
        });
      }
    }
  },

  setTargetSlot: (slotIndex) => {
    const state = get();
    if (state.phase !== 'playing' || state.feedbackType !== null) return;
    if (state.slots[slotIndex] === '') return; // 空格不可瞄准
    // 再次点击同一格则取消瞄准
    set({ targetSlotIndex: state.targetSlotIndex === slotIndex ? null : slotIndex });
  },

  clearForRetry: () => {
    const state = get();
    const len = state.celebrities[state.currentIndex]?.name.length ?? 0;
    set({
      slots: emptySlots(len),
      slotPoolIndices: emptyIndices(len),
      targetSlotIndex: null,
      feedbackType: null,
    });
  },

  nextRound: (nextCharPool) => {
    const state = get();
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.celebrities.length) {
      const isNew = saveHighScore(state.totalScore);
      set({ phase: 'gameEnd', isNewHighScore: isNew });
    } else {
      const len = state.celebrities[nextIndex].name.length;
      set({
        phase: 'playing',
        currentIndex: nextIndex,
        charPool: nextCharPool,
        slots: emptySlots(len),
        slotPoolIndices: emptyIndices(len),
        targetSlotIndex: null,
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
      slots: [],
      slotPoolIndices: [],
      targetSlotIndex: null,
      wrongAttempts: 0,
      feedbackType: null,
      rounds: [],
      totalScore: 0,
      correctCount: 0,
      isNewHighScore: false,
    }),
}));
