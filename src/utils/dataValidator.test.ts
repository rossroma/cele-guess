import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateCelebrity, validateCelebritiesData } from './dataValidator';
import { RegionEnum, GenderEnum, ProfessionEnum } from '../types';

describe('validateCelebrity', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true for valid celebrity data', () => {
    const validCelebrity = {
      id: '1',
      name: '张三',
      photo: 'photo1.jpg',
      region: RegionEnum.MAINLAND,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.FILM_ACTOR
    };

    expect(validateCelebrity(validCelebrity)).toBe(true);
  });

  it('should return false when id is missing', () => {
    const celebrity = {
      name: '张三',
      photo: 'photo1.jpg',
      region: RegionEnum.MAINLAND,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.FILM_ACTOR
    };

    expect(validateCelebrity(celebrity)).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Missing required fields', celebrity);
  });

  it('should return false when name is missing', () => {
    const celebrity = {
      id: '1',
      photo: 'photo1.jpg',
      region: RegionEnum.MAINLAND,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.FILM_ACTOR
    };

    expect(validateCelebrity(celebrity)).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Missing required fields', celebrity);
  });

  it('should return false when photo is missing', () => {
    const celebrity = {
      id: '1',
      name: '张三',
      region: RegionEnum.MAINLAND,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.FILM_ACTOR
    };

    expect(validateCelebrity(celebrity)).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Missing required fields', celebrity);
  });

  it('should return false for invalid region enum', () => {
    const celebrity = {
      id: '1',
      name: '张三',
      photo: 'photo1.jpg',
      region: 999,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.FILM_ACTOR
    };

    expect(validateCelebrity(celebrity)).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Invalid region', celebrity);
  });

  it('should return false for invalid gender enum', () => {
    const celebrity = {
      id: '1',
      name: '张三',
      photo: 'photo1.jpg',
      region: RegionEnum.MAINLAND,
      gender: 999,
      profession: ProfessionEnum.FILM_ACTOR
    };

    expect(validateCelebrity(celebrity)).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Invalid gender', celebrity);
  });

  it('should return false for invalid profession enum', () => {
    const celebrity = {
      id: '1',
      name: '张三',
      photo: 'photo1.jpg',
      region: RegionEnum.MAINLAND,
      gender: GenderEnum.MALE,
      profession: 999
    };

    expect(validateCelebrity(celebrity)).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Invalid profession', celebrity);
  });

  it('should accept all valid region enum values', () => {
    const regions = [
      RegionEnum.MAINLAND,
      RegionEnum.HONGKONG,
      RegionEnum.TAIWAN,
      RegionEnum.JAPAN_KOREA,
      RegionEnum.OTHER
    ];

    regions.forEach(region => {
      const celebrity = {
        id: '1',
        name: '张三',
        photo: 'photo1.jpg',
        region,
        gender: GenderEnum.MALE,
        profession: ProfessionEnum.FILM_ACTOR
      };
      expect(validateCelebrity(celebrity)).toBe(true);
    });
  });

  it('should accept all valid gender enum values', () => {
    const genders = [GenderEnum.MALE, GenderEnum.FEMALE];

    genders.forEach(gender => {
      const celebrity = {
        id: '1',
        name: '张三',
        photo: 'photo1.jpg',
        region: RegionEnum.MAINLAND,
        gender,
        profession: ProfessionEnum.FILM_ACTOR
      };
      expect(validateCelebrity(celebrity)).toBe(true);
    });
  });

  it('should accept all valid profession enum values', () => {
    const professions = [
      ProfessionEnum.FILM_ACTOR,
      ProfessionEnum.CROSSTALK_ACTOR,
      ProfessionEnum.STANDUP_COMEDIAN
    ];

    professions.forEach(profession => {
      const celebrity = {
        id: '1',
        name: '张三',
        photo: 'photo1.jpg',
        region: RegionEnum.MAINLAND,
        gender: GenderEnum.MALE,
        profession
      };
      expect(validateCelebrity(celebrity)).toBe(true);
    });
  });
});

describe('validateCelebritiesData', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return valid celebrities from data', () => {
    const data = {
      celebrities: [
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
        }
      ]
    };

    const result = validateCelebritiesData(data);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('张三');
    expect(result[1].name).toBe('李四');
  });

  it('should throw error for null data', () => {
    expect(() => validateCelebritiesData(null)).toThrow('Invalid data format');
  });

  it('should throw error for undefined data', () => {
    expect(() => validateCelebritiesData(undefined)).toThrow('Invalid data format');
  });

  it('should throw error when celebrities is not an array', () => {
    const data = {
      celebrities: 'not an array'
    };

    expect(() => validateCelebritiesData(data)).toThrow('Invalid data format');
  });

  it('should throw error when celebrities field is missing', () => {
    const data = {};

    expect(() => validateCelebritiesData(data)).toThrow('Invalid data format');
  });

  it('should filter out invalid celebrities and warn', () => {
    const data = {
      celebrities: [
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
          region: 999, // Invalid region
          gender: GenderEnum.FEMALE,
          profession: ProfessionEnum.FILM_ACTOR
        },
        {
          id: '3',
          // Missing name
          photo: 'photo3.jpg',
          region: RegionEnum.TAIWAN,
          gender: GenderEnum.MALE,
          profession: ProfessionEnum.CROSSTALK_ACTOR
        }
      ]
    };

    const result = validateCelebritiesData(data);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('张三');
    expect(console.warn).toHaveBeenCalledWith('2 invalid celebrities filtered out');
  });

  it('should not warn when all celebrities are valid', () => {
    const data = {
      celebrities: [
        {
          id: '1',
          name: '张三',
          photo: 'photo1.jpg',
          region: RegionEnum.MAINLAND,
          gender: GenderEnum.MALE,
          profession: ProfessionEnum.FILM_ACTOR
        }
      ]
    };

    validateCelebritiesData(data);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should return empty array when all celebrities are invalid', () => {
    const data = {
      celebrities: [
        { id: '1' }, // Missing required fields
        { name: '李四' }, // Missing required fields
        { photo: 'photo3.jpg' } // Missing required fields
      ]
    };

    const result = validateCelebritiesData(data);
    expect(result).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith('3 invalid celebrities filtered out');
  });

  it('should return empty array when celebrities array is empty', () => {
    const data = {
      celebrities: []
    };

    const result = validateCelebritiesData(data);
    expect(result).toHaveLength(0);
    expect(console.warn).not.toHaveBeenCalled();
  });
});
