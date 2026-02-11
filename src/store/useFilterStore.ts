import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterOptions } from '../types';

interface FilterState {
  filters: FilterOptions;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const defaultFilters: FilterOptions = {
  regions: [],
  genders: [],
  professions: []
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      hasActiveFilters: () => {
        const { filters } = get();
        return (
          filters.regions.length > 0 ||
          filters.genders.length > 0 ||
          filters.professions.length > 0
        );
      }
    }),
    {
      name: 'celeguess-filters',
      version: 1
    }
  )
);
