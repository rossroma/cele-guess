import { describe, it, expect } from 'vitest';
import { filterCelebrities } from './filter';
import { RegionEnum, GenderEnum, ProfessionEnum, type Celebrity, type FilterOptions } from '../types';

describe('filterCelebrities', () => {
  const mockCelebrities: Celebrity[] = [
    {
      id: '1',
      name: '张三',
      photo: 'photo1.jpg',
      region: RegionEnum.MAINLAND,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.FILM_ACTOR
    },
    {
      id: '2',
      name: '李四',
      photo: 'photo2.jpg',
      region: RegionEnum.HONGKONG,
      gender: GenderEnum.FEMALE,
      profession: ProfessionEnum.FILM_ACTOR
    },
    {
      id: '3',
      name: '王五',
      photo: 'photo3.jpg',
      region: RegionEnum.TAIWAN,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.CROSSTALK_ACTOR
    },
    {
      id: '4',
      name: '赵六',
      photo: 'photo4.jpg',
      region: RegionEnum.MAINLAND,
      gender: GenderEnum.FEMALE,
      profession: ProfessionEnum.STANDUP_COMEDIAN
    }
  ];

  it('should return all celebrities when no filters are applied', () => {
    const filters: FilterOptions = {
      regions: [],
      genders: [],
      professions: []
    };

    const result = filterCelebrities(mockCelebrities, filters);
    expect(result).toHaveLength(4);
    expect(result).toEqual(mockCelebrities);
  });

  it('should filter by region correctly', () => {
    const filters: FilterOptions = {
      regions: [RegionEnum.MAINLAND],
      genders: [],
      professions: []
    };

    const result = filterCelebrities(mockCelebrities, filters);
    expect(result).toHaveLength(2);
    expect(result.every(c => c.region === RegionEnum.MAINLAND)).toBe(true);
  });

  it('should filter by multiple regions', () => {
    const filters: FilterOptions = {
      regions: [RegionEnum.MAINLAND, RegionEnum.HONGKONG],
      genders: [],
      professions: []
    };

    const result = filterCelebrities(mockCelebrities, filters);
    expect(result).toHaveLength(3);
    expect(result.every(c =>
      c.region === RegionEnum.MAINLAND || c.region === RegionEnum.HONGKONG
    )).toBe(true);
  });

  it('should filter by gender correctly', () => {
    const filters: FilterOptions = {
      regions: [],
      genders: [GenderEnum.MALE],
      professions: []
    };

    const result = filterCelebrities(mockCelebrities, filters);
    expect(result).toHaveLength(2);
    expect(result.every(c => c.gender === GenderEnum.MALE)).toBe(true);
  });

  it('should filter by profession correctly', () => {
    const filters: FilterOptions = {
      regions: [],
      genders: [],
      professions: [ProfessionEnum.FILM_ACTOR]
    };

    const result = filterCelebrities(mockCelebrities, filters);
    expect(result).toHaveLength(2);
    expect(result.every(c => c.profession === ProfessionEnum.FILM_ACTOR)).toBe(true);
  });

  it('should apply multiple filters correctly', () => {
    const filters: FilterOptions = {
      regions: [RegionEnum.MAINLAND],
      genders: [GenderEnum.MALE],
      professions: [ProfessionEnum.FILM_ACTOR]
    };

    const result = filterCelebrities(mockCelebrities, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('张三');
  });

  it('should return empty array when no celebrities match filters', () => {
    const filters: FilterOptions = {
      regions: [RegionEnum.JAPAN_KOREA],
      genders: [],
      professions: []
    };

    const result = filterCelebrities(mockCelebrities, filters);
    expect(result).toHaveLength(0);
  });

  it('should handle empty celebrity array', () => {
    const filters: FilterOptions = {
      regions: [RegionEnum.MAINLAND],
      genders: [],
      professions: []
    };

    const result = filterCelebrities([], filters);
    expect(result).toHaveLength(0);
  });

  it('should filter by multiple genders and professions', () => {
    const filters: FilterOptions = {
      regions: [],
      genders: [GenderEnum.FEMALE],
      professions: [ProfessionEnum.FILM_ACTOR, ProfessionEnum.STANDUP_COMEDIAN]
    };

    const result = filterCelebrities(mockCelebrities, filters);
    expect(result).toHaveLength(2);
    expect(result.every(c => c.gender === GenderEnum.FEMALE)).toBe(true);
    expect(result.every(c =>
      c.profession === ProfessionEnum.FILM_ACTOR ||
      c.profession === ProfessionEnum.STANDUP_COMEDIAN
    )).toBe(true);
  });
});
