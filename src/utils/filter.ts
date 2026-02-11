import type { Celebrity, FilterOptions } from '../types';

export const filterCelebrities = (
  celebrities: Celebrity[],
  filters: FilterOptions
): Celebrity[] => {
  return celebrities.filter((celebrity) => {
    // 地区筛选
    if (filters.regions.length > 0 &&
        !filters.regions.includes(celebrity.region)) {
      return false;
    }

    // 性别筛选
    if (filters.genders.length > 0 &&
        !filters.genders.includes(celebrity.gender)) {
      return false;
    }

    // 职业筛选
    if (filters.professions.length > 0 &&
        !filters.professions.includes(celebrity.profession)) {
      return false;
    }

    return true;
  });
};
