import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from './useGameStore';
import { RegionEnum, GenderEnum, ProfessionEnum, type Celebrity } from '../types';

describe('useGameStore', () => {
  const mockCelebrity: Celebrity = {
    id: '1',
    name: '张三',
    photo: 'photo1.jpg',
    region: RegionEnum.MAINLAND,
    gender: GenderEnum.MALE,
    profession: ProfessionEnum.FILM_ACTOR
  };

  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useGameStore());

    expect(result.current.currentCelebrity).toBeNull();
    expect(result.current.isAnswerVisible).toBe(false);
    expect(result.current.viewedCount).toBe(0);
  });

  describe('setCurrentCelebrity', () => {
    it('should set current celebrity', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setCurrentCelebrity(mockCelebrity);
      });

      expect(result.current.currentCelebrity).toEqual(mockCelebrity);
    });

    it('should hide answer when setting new celebrity', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setCurrentCelebrity(mockCelebrity);
        result.current.showAnswer();
      });

      expect(result.current.isAnswerVisible).toBe(true);

      const newCelebrity: Celebrity = {
        ...mockCelebrity,
        id: '2',
        name: '李四'
      };

      act(() => {
        result.current.setCurrentCelebrity(newCelebrity);
      });

      expect(result.current.currentCelebrity).toEqual(newCelebrity);
      expect(result.current.isAnswerVisible).toBe(false);
    });

    it('should accept null celebrity', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setCurrentCelebrity(mockCelebrity);
        result.current.setCurrentCelebrity(null);
      });

      expect(result.current.currentCelebrity).toBeNull();
    });
  });

  describe('showAnswer', () => {
    it('should set isAnswerVisible to true', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.showAnswer();
      });

      expect(result.current.isAnswerVisible).toBe(true);
    });

    it('should keep isAnswerVisible true on multiple calls', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.showAnswer();
        result.current.showAnswer();
      });

      expect(result.current.isAnswerVisible).toBe(true);
    });
  });

  describe('hideAnswer', () => {
    it('should set isAnswerVisible to false', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.showAnswer();
        result.current.hideAnswer();
      });

      expect(result.current.isAnswerVisible).toBe(false);
    });

    it('should keep isAnswerVisible false when already hidden', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.hideAnswer();
      });

      expect(result.current.isAnswerVisible).toBe(false);
    });
  });

  describe('incrementViewedCount', () => {
    it('should increment viewedCount from 0 to 1', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.incrementViewedCount();
      });

      expect(result.current.viewedCount).toBe(1);
    });

    it('should increment viewedCount multiple times', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.incrementViewedCount();
        result.current.incrementViewedCount();
        result.current.incrementViewedCount();
      });

      expect(result.current.viewedCount).toBe(3);
    });
  });

  describe('resetGame', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setCurrentCelebrity(mockCelebrity);
        result.current.showAnswer();
        result.current.incrementViewedCount();
        result.current.incrementViewedCount();
      });

      expect(result.current.currentCelebrity).toEqual(mockCelebrity);
      expect(result.current.isAnswerVisible).toBe(true);
      expect(result.current.viewedCount).toBe(2);

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.currentCelebrity).toBeNull();
      expect(result.current.isAnswerVisible).toBe(false);
      expect(result.current.viewedCount).toBe(0);
    });
  });

  describe('state persistence across hook instances', () => {
    it('should share state between multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useGameStore());
      const { result: result2 } = renderHook(() => useGameStore());

      act(() => {
        result1.current.setCurrentCelebrity(mockCelebrity);
        result1.current.incrementViewedCount();
      });

      expect(result2.current.currentCelebrity).toEqual(mockCelebrity);
      expect(result2.current.viewedCount).toBe(1);
    });
  });
});
