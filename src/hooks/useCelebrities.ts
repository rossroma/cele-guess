import { useMemo } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import celebritiesData from '../data/celebrities.json';
import { filterCelebrities } from '../utils/filter';
import { validateCelebritiesData } from '../utils/dataValidator';
import type { Celebrity } from '../types';

export const useCelebrities = () => {
  const { filters } = useFilterStore();

  const allCelebrities: Celebrity[] = useMemo(
    () => validateCelebritiesData(celebritiesData),
    []
  );

  const filteredCelebrities = useMemo(
    () => filterCelebrities(allCelebrities, filters),
    [allCelebrities, filters]
  );

  return {
    allCelebrities,
    filteredCelebrities,
    totalCount: allCelebrities.length,
    filteredCount: filteredCelebrities.length
  };
};
