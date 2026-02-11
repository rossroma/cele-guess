import {
  RegionEnum,
  GenderEnum,
  ProfessionEnum,
  REGION_LABELS,
  GENDER_LABELS,
  PROFESSION_LABELS,
  type Celebrity
} from '../types';

/**
 * 获取地区显示文本
 */
export const getRegionLabel = (region: RegionEnum): string => {
  return REGION_LABELS[region] || '未知';
};

/**
 * 获取性别显示文本
 */
export const getGenderLabel = (gender: GenderEnum): string => {
  return GENDER_LABELS[gender] || '未知';
};

/**
 * 获取职业显示文本
 */
export const getProfessionLabel = (profession: ProfessionEnum): string => {
  return PROFESSION_LABELS[profession] || '未知';
};

/**
 * 获取明星完整信息文本
 */
export const getCelebrityInfoText = (celebrity: Celebrity): string => {
  return `${celebrity.name} - ${getRegionLabel(celebrity.region)} - ${getGenderLabel(celebrity.gender)} - ${getProfessionLabel(celebrity.profession)}`;
};
