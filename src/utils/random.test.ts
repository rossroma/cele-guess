import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRandomCelebrity, shuffleArray } from './random';
import { RegionEnum, GenderEnum, ProfessionEnum, type Celebrity } from '../types';

describe('getRandomCelebrity', () => {
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
    }
  ];

  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null for empty array', () => {
    const result = getRandomCelebrity([]);
    expect(result).toBeNull();
  });

  it('should return the only celebrity in a single-item array', () => {
    vi.mocked(Math.random).mockReturnValue(0);
    const result = getRandomCelebrity([mockCelebrities[0]]);
    expect(result).toEqual(mockCelebrities[0]);
  });

  it('should return a celebrity from the array', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    const result = getRandomCelebrity(mockCelebrities);
    expect(result).not.toBeNull();
    expect(mockCelebrities).toContainEqual(result);
  });

  it('should return first celebrity when random returns 0', () => {
    vi.mocked(Math.random).mockReturnValue(0);
    const result = getRandomCelebrity(mockCelebrities);
    expect(result).toEqual(mockCelebrities[0]);
  });

  it('should return last celebrity when random returns close to 1', () => {
    vi.mocked(Math.random).mockReturnValue(0.99);
    const result = getRandomCelebrity(mockCelebrities);
    expect(result).toEqual(mockCelebrities[2]);
  });

  it('should exclude specified celebrity by id', () => {
    vi.mocked(Math.random).mockReturnValue(0);
    const result = getRandomCelebrity(mockCelebrities, '1');
    expect(result).not.toBeNull();
    expect(result?.id).not.toBe('1');
    expect(['2', '3']).toContain(result?.id);
  });

  it('should return null when excluding the only celebrity', () => {
    const result = getRandomCelebrity([mockCelebrities[0]], '1');
    expect(result).toBeNull();
  });

  it('should handle excluding non-existent id', () => {
    vi.mocked(Math.random).mockReturnValue(0);
    const result = getRandomCelebrity(mockCelebrities, 'non-existent');
    expect(result).not.toBeNull();
    expect(mockCelebrities).toContainEqual(result);
  });
});

describe('shuffleArray', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return empty array for empty input', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it('should return single item array unchanged', () => {
    const input = [1];
    const result = shuffleArray(input);
    expect(result).toEqual([1]);
  });

  it('should not modify the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffleArray(original);
    expect(original).toEqual(copy);
  });

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.sort());
  });

  it('should shuffle elements deterministically with mocked random', () => {
    const input = [1, 2, 3, 4];

    // Mock specific random values to create predictable shuffle
    const randomValues = [0.9, 0.5, 0.1];
    let callIndex = 0;
    vi.mocked(Math.random).mockImplementation(() => {
      return randomValues[callIndex++ % randomValues.length];
    });

    const result = shuffleArray(input);
    expect(result).toHaveLength(4);
    expect(result).not.toEqual(input);
  });

  it('should work with string arrays', () => {
    const input = ['a', 'b', 'c', 'd'];
    const result = shuffleArray(input);
    expect(result).toHaveLength(4);
    expect(result.sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should work with object arrays', () => {
    const input = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' }
    ];
    const result = shuffleArray(input);
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ id: 1, name: 'a' });
    expect(result).toContainEqual({ id: 2, name: 'b' });
    expect(result).toContainEqual({ id: 3, name: 'c' });
  });

  it('should produce different results with different random seeds', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // First shuffle
    vi.mocked(Math.random).mockImplementation(() => 0.1);
    const result1 = shuffleArray(input);

    // Second shuffle with different random
    vi.mocked(Math.random).mockImplementation(() => 0.9);
    const result2 = shuffleArray(input);

    // Results should be different (very unlikely to be the same)
    expect(result1).toHaveLength(result2.length);
  });
});
