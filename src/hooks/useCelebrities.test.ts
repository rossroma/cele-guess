import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCelebrities } from './useCelebrities';
import { useFilterStore } from '../store/useFilterStore';
import { RegionEnum, GenderEnum, ProfessionEnum } from '../types';

// Test with actual celebrities.json data (10 celebrities total)
// Region: MAINLAND=5, HONGKONG=2, TAIWAN=2, OTHER=1
// Gender: MALE=6, FEMALE=4
// Profession: FILM_ACTOR=8, CROSSTALK_ACTOR=1, STANDUP_COMEDIAN=1

describe('useCelebrities', () => {
  beforeEach(() => {
    // Reset filters before each test
    const { result } = renderHook(() => useFilterStore());
    act(() => {
      result.current.resetFilters();
    });
    localStorage.clear();
  });

  it('should return all celebrities when no filters are applied', () => {
    const { result } = renderHook(() => useCelebrities());

    expect(result.current.allCelebrities).toHaveLength(10);
    expect(result.current.filteredCelebrities).toHaveLength(10);
    expect(result.current.totalCount).toBe(10);
    expect(result.current.filteredCount).toBe(10);
  });

  it('should filter celebrities by region', () => {
    const { result: filterResult } = renderHook(() => useFilterStore());

    act(() => {
      filterResult.current.setFilters({
        regions: [RegionEnum.MAINLAND]
      });
    });

    const { result: celebResult } = renderHook(() => useCelebrities());

    expect(celebResult.current.filteredCelebrities).toHaveLength(5);
    expect(celebResult.current.filteredCelebrities.every(c => c.region === RegionEnum.MAINLAND)).toBe(true);
    expect(celebResult.current.filteredCount).toBe(5);
    expect(celebResult.current.totalCount).toBe(10);
  });

  it('should filter celebrities by gender', () => {
    const { result: filterResult } = renderHook(() => useFilterStore());

    act(() => {
      filterResult.current.setFilters({
        genders: [GenderEnum.MALE]
      });
    });

    const { result: celebResult } = renderHook(() => useCelebrities());

    expect(celebResult.current.filteredCelebrities).toHaveLength(6);
    expect(celebResult.current.filteredCelebrities.every(c => c.gender === GenderEnum.MALE)).toBe(true);
  });

  it('should filter celebrities by profession', () => {
    const { result: filterResult } = renderHook(() => useFilterStore());

    act(() => {
      filterResult.current.setFilters({
        professions: [ProfessionEnum.FILM_ACTOR]
      });
    });

    const { result: celebResult } = renderHook(() => useCelebrities());

    expect(celebResult.current.filteredCelebrities).toHaveLength(8);
    expect(celebResult.current.filteredCelebrities.every(c => c.profession === ProfessionEnum.FILM_ACTOR)).toBe(true);
  });

  it('should apply multiple filters', () => {
    const { result: filterResult } = renderHook(() => useFilterStore());

    act(() => {
      filterResult.current.setFilters({
        regions: [RegionEnum.MAINLAND],
        genders: [GenderEnum.MALE]
      });
    });

    const { result: celebResult } = renderHook(() => useCelebrities());

    // MAINLAND + MALE = 张艺兴, 郭德纲, 李诞 (3 celebrities)
    expect(celebResult.current.filteredCelebrities).toHaveLength(3);
    expect(celebResult.current.filteredCelebrities.every(c =>
      c.region === RegionEnum.MAINLAND && c.gender === GenderEnum.MALE
    )).toBe(true);
  });

  it('should return empty array when no celebrities match filters', () => {
    const { result: filterResult } = renderHook(() => useFilterStore());

    act(() => {
      filterResult.current.setFilters({
        regions: [RegionEnum.JAPAN_KOREA]
      });
    });

    const { result: celebResult } = renderHook(() => useCelebrities());

    expect(celebResult.current.filteredCelebrities).toHaveLength(0);
    expect(celebResult.current.filteredCount).toBe(0);
    expect(celebResult.current.totalCount).toBe(10);
  });

  it('should maintain allCelebrities regardless of filters', () => {
    const { result: celebResult1 } = renderHook(() => useCelebrities());
    const allCelebritiesInitial = celebResult1.current.allCelebrities;

    const { result: filterResult } = renderHook(() => useFilterStore());

    act(() => {
      filterResult.current.setFilters({
        regions: [RegionEnum.MAINLAND]
      });
    });

    const { result: celebResult2 } = renderHook(() => useCelebrities());

    expect(celebResult2.current.allCelebrities).toHaveLength(10);
    expect(celebResult2.current.allCelebrities).toEqual(allCelebritiesInitial);
  });

  it('should update filtered celebrities when filters change', () => {
    const { result: filterResult } = renderHook(() => useFilterStore());

    act(() => {
      filterResult.current.setFilters({
        regions: [RegionEnum.MAINLAND]
      });
    });

    const { result: celebResult1 } = renderHook(() => useCelebrities());
    expect(celebResult1.current.filteredCount).toBe(5);

    act(() => {
      filterResult.current.setFilters({
        regions: [RegionEnum.HONGKONG]
      });
    });

    const { result: celebResult2 } = renderHook(() => useCelebrities());
    expect(celebResult2.current.filteredCount).toBe(2);
  });

  it('should filter by multiple regions', () => {
    const { result: filterResult } = renderHook(() => useFilterStore());

    act(() => {
      filterResult.current.setFilters({
        regions: [RegionEnum.MAINLAND, RegionEnum.HONGKONG]
      });
    });

    const { result: celebResult } = renderHook(() => useCelebrities());

    // MAINLAND + HONGKONG = 5 + 2 = 7
    expect(celebResult.current.filteredCelebrities).toHaveLength(7);
    expect(celebResult.current.filteredCelebrities.every(c =>
      c.region === RegionEnum.MAINLAND || c.region === RegionEnum.HONGKONG
    )).toBe(true);
  });

  it('should reset to all celebrities when filters are cleared', () => {
    const { result: filterResult } = renderHook(() => useFilterStore());

    act(() => {
      filterResult.current.setFilters({
        regions: [RegionEnum.MAINLAND]
      });
    });

    const { result: celebResult1 } = renderHook(() => useCelebrities());
    expect(celebResult1.current.filteredCount).toBe(5);

    act(() => {
      filterResult.current.resetFilters();
    });

    const { result: celebResult2 } = renderHook(() => useCelebrities());
    expect(celebResult2.current.filteredCount).toBe(10);
  });
});
