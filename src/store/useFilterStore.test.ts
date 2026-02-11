import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterStore } from './useFilterStore';
import { RegionEnum, GenderEnum, ProfessionEnum } from '../types';

describe('useFilterStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Reset store state after each test
    const { result } = renderHook(() => useFilterStore());
    act(() => {
      result.current.resetFilters();
    });
  });

  it('should have initial empty filters', () => {
    const { result } = renderHook(() => useFilterStore());

    expect(result.current.filters).toEqual({
      regions: [],
      genders: [],
      professions: []
    });
  });

  describe('setFilters', () => {
    it('should set region filters', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          regions: [RegionEnum.MAINLAND, RegionEnum.HONGKONG]
        });
      });

      expect(result.current.filters.regions).toEqual([
        RegionEnum.MAINLAND,
        RegionEnum.HONGKONG
      ]);
      expect(result.current.filters.genders).toEqual([]);
      expect(result.current.filters.professions).toEqual([]);
    });

    it('should set gender filters', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          genders: [GenderEnum.MALE]
        });
      });

      expect(result.current.filters.genders).toEqual([GenderEnum.MALE]);
    });

    it('should set profession filters', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          professions: [ProfessionEnum.FILM_ACTOR, ProfessionEnum.CROSSTALK_ACTOR]
        });
      });

      expect(result.current.filters.professions).toEqual([
        ProfessionEnum.FILM_ACTOR,
        ProfessionEnum.CROSSTALK_ACTOR
      ]);
    });

    it('should merge partial filters with existing state', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          regions: [RegionEnum.MAINLAND]
        });
        result.current.setFilters({
          genders: [GenderEnum.FEMALE]
        });
      });

      expect(result.current.filters).toEqual({
        regions: [RegionEnum.MAINLAND],
        genders: [GenderEnum.FEMALE],
        professions: []
      });
    });

    it('should override existing filter values', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          regions: [RegionEnum.MAINLAND]
        });
        result.current.setFilters({
          regions: [RegionEnum.HONGKONG, RegionEnum.TAIWAN]
        });
      });

      expect(result.current.filters.regions).toEqual([
        RegionEnum.HONGKONG,
        RegionEnum.TAIWAN
      ]);
    });

    it('should set all filters at once', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          regions: [RegionEnum.MAINLAND],
          genders: [GenderEnum.MALE],
          professions: [ProfessionEnum.FILM_ACTOR]
        });
      });

      expect(result.current.filters).toEqual({
        regions: [RegionEnum.MAINLAND],
        genders: [GenderEnum.MALE],
        professions: [ProfessionEnum.FILM_ACTOR]
      });
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to empty arrays', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          regions: [RegionEnum.MAINLAND],
          genders: [GenderEnum.MALE],
          professions: [ProfessionEnum.FILM_ACTOR]
        });
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({
        regions: [],
        genders: [],
        professions: []
      });
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false when no filters are set', () => {
      const { result } = renderHook(() => useFilterStore());

      expect(result.current.hasActiveFilters()).toBe(false);
    });

    it('should return true when region filters are set', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          regions: [RegionEnum.MAINLAND]
        });
      });

      expect(result.current.hasActiveFilters()).toBe(true);
    });

    it('should return true when gender filters are set', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          genders: [GenderEnum.MALE]
        });
      });

      expect(result.current.hasActiveFilters()).toBe(true);
    });

    it('should return true when profession filters are set', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          professions: [ProfessionEnum.FILM_ACTOR]
        });
      });

      expect(result.current.hasActiveFilters()).toBe(true);
    });

    it('should return true when multiple filters are set', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          regions: [RegionEnum.MAINLAND],
          genders: [GenderEnum.MALE]
        });
      });

      expect(result.current.hasActiveFilters()).toBe(true);
    });

    it('should return false after resetting filters', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          regions: [RegionEnum.MAINLAND]
        });
        result.current.resetFilters();
      });

      expect(result.current.hasActiveFilters()).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist filters to localStorage', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilters({
          regions: [RegionEnum.MAINLAND],
          genders: [GenderEnum.MALE]
        });
      });

      const stored = localStorage.getItem('celeguess-filters');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.filters).toEqual({
        regions: [RegionEnum.MAINLAND],
        genders: [GenderEnum.MALE],
        professions: []
      });
    });

    it('should restore filters from localStorage', () => {
      // Set initial filters
      const { result: result1 } = renderHook(() => useFilterStore());
      act(() => {
        result1.current.setFilters({
          regions: [RegionEnum.HONGKONG],
          professions: [ProfessionEnum.CROSSTALK_ACTOR]
        });
      });

      // Create new hook instance to simulate page reload
      const { result: result2 } = renderHook(() => useFilterStore());

      expect(result2.current.filters).toEqual({
        regions: [RegionEnum.HONGKONG],
        genders: [],
        professions: [ProfessionEnum.CROSSTALK_ACTOR]
      });
    });
  });

  describe('state sharing across hook instances', () => {
    it('should share state between multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useFilterStore());
      const { result: result2 } = renderHook(() => useFilterStore());

      act(() => {
        result1.current.setFilters({
          regions: [RegionEnum.TAIWAN]
        });
      });

      expect(result2.current.filters.regions).toEqual([RegionEnum.TAIWAN]);
    });

    it('should update hasActiveFilters across instances', () => {
      const { result: result1 } = renderHook(() => useFilterStore());
      const { result: result2 } = renderHook(() => useFilterStore());

      act(() => {
        result1.current.setFilters({
          genders: [GenderEnum.FEMALE]
        });
      });

      expect(result2.current.hasActiveFilters()).toBe(true);
    });
  });
});
