import { describe, it, expect } from 'vitest';
import {
  getRegionLabel,
  getGenderLabel,
  getProfessionLabel,
  getCelebrityInfoText
} from './labelMapper';
import { RegionEnum, GenderEnum, ProfessionEnum, type Celebrity } from '../types';

describe('getRegionLabel', () => {
  it('should return correct label for MAINLAND', () => {
    expect(getRegionLabel(RegionEnum.MAINLAND)).toBe('内地');
  });

  it('should return correct label for HONGKONG', () => {
    expect(getRegionLabel(RegionEnum.HONGKONG)).toBe('香港');
  });

  it('should return correct label for TAIWAN', () => {
    expect(getRegionLabel(RegionEnum.TAIWAN)).toBe('台湾');
  });

  it('should return correct label for JAPAN_KOREA', () => {
    expect(getRegionLabel(RegionEnum.JAPAN_KOREA)).toBe('日韩');
  });

  it('should return correct label for OTHER', () => {
    expect(getRegionLabel(RegionEnum.OTHER)).toBe('其他');
  });

  it('should return "未知" for invalid region', () => {
    expect(getRegionLabel(999 as RegionEnum)).toBe('未知');
  });
});

describe('getGenderLabel', () => {
  it('should return correct label for MALE', () => {
    expect(getGenderLabel(GenderEnum.MALE)).toBe('男');
  });

  it('should return correct label for FEMALE', () => {
    expect(getGenderLabel(GenderEnum.FEMALE)).toBe('女');
  });

  it('should return "未知" for invalid gender', () => {
    expect(getGenderLabel(999 as GenderEnum)).toBe('未知');
  });
});

describe('getProfessionLabel', () => {
  it('should return correct label for FILM_ACTOR', () => {
    expect(getProfessionLabel(ProfessionEnum.FILM_ACTOR)).toBe('影视演员');
  });

  it('should return correct label for CROSSTALK_ACTOR', () => {
    expect(getProfessionLabel(ProfessionEnum.CROSSTALK_ACTOR)).toBe('相声演员');
  });

  it('should return correct label for STANDUP_COMEDIAN', () => {
    expect(getProfessionLabel(ProfessionEnum.STANDUP_COMEDIAN)).toBe('脱口秀演员');
  });

  it('should return "未知" for invalid profession', () => {
    expect(getProfessionLabel(999 as ProfessionEnum)).toBe('未知');
  });
});

describe('getCelebrityInfoText', () => {
  it('should return formatted info text for celebrity', () => {
    const celebrity: Celebrity = {
      id: '1',
      name: '张三',
      photo: 'photo1.jpg',
      region: RegionEnum.MAINLAND,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.FILM_ACTOR
    };

    const result = getCelebrityInfoText(celebrity);
    expect(result).toBe('张三 - 内地 - 男 - 影视演员');
  });

  it('should handle HONGKONG female crosstalk actor', () => {
    const celebrity: Celebrity = {
      id: '2',
      name: '李四',
      photo: 'photo2.jpg',
      region: RegionEnum.HONGKONG,
      gender: GenderEnum.FEMALE,
      profession: ProfessionEnum.CROSSTALK_ACTOR
    };

    const result = getCelebrityInfoText(celebrity);
    expect(result).toBe('李四 - 香港 - 女 - 相声演员');
  });

  it('should handle TAIWAN male standup comedian', () => {
    const celebrity: Celebrity = {
      id: '3',
      name: '王五',
      photo: 'photo3.jpg',
      region: RegionEnum.TAIWAN,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.STANDUP_COMEDIAN
    };

    const result = getCelebrityInfoText(celebrity);
    expect(result).toBe('王五 - 台湾 - 男 - 脱口秀演员');
  });

  it('should handle JAPAN_KOREA region', () => {
    const celebrity: Celebrity = {
      id: '4',
      name: '赵六',
      photo: 'photo4.jpg',
      region: RegionEnum.JAPAN_KOREA,
      gender: GenderEnum.FEMALE,
      profession: ProfessionEnum.FILM_ACTOR
    };

    const result = getCelebrityInfoText(celebrity);
    expect(result).toBe('赵六 - 日韩 - 女 - 影视演员');
  });

  it('should handle OTHER region', () => {
    const celebrity: Celebrity = {
      id: '5',
      name: '孙七',
      photo: 'photo5.jpg',
      region: RegionEnum.OTHER,
      gender: GenderEnum.MALE,
      profession: ProfessionEnum.FILM_ACTOR
    };

    const result = getCelebrityInfoText(celebrity);
    expect(result).toBe('孙七 - 其他 - 男 - 影视演员');
  });

  it('should handle invalid enum values with "未知"', () => {
    const celebrity: Celebrity = {
      id: '6',
      name: '周八',
      photo: 'photo6.jpg',
      region: 999 as RegionEnum,
      gender: 999 as GenderEnum,
      profession: 999 as ProfessionEnum
    };

    const result = getCelebrityInfoText(celebrity);
    expect(result).toBe('周八 - 未知 - 未知 - 未知');
  });
});
