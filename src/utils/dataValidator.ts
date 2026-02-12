import { type Celebrity } from '../types';

/**
 * 验证明星数据的有效性
 */
export const validateCelebrity = (celebrity: any): celebrity is Celebrity => {
  // 检查必需字段
  if (!celebrity.id || !celebrity.name || !celebrity.photo) {
    console.error('Missing required fields', celebrity);
    return false;
  }

  // 验证枚举值
  // const validRegions = Object.values(RegionEnum).filter(v => typeof v === 'number');
  // const validGenders = Object.values(GenderEnum).filter(v => typeof v === 'number');
  // const validProfessions = Object.values(ProfessionEnum).filter(v => typeof v === 'number');

  // if (!validRegions.includes(celebrity.region)) {
  //   console.error('Invalid region', celebrity);
  //   return false;
  // }

  // if (!validGenders.includes(celebrity.gender)) {
  //   console.error('Invalid gender', celebrity);
  //   return false;
  // }

  // if (!validProfessions.includes(celebrity.profession)) {
  //   console.error('Invalid profession', celebrity);
  //   return false;
  // }

  return true;
};

/**
 * 验证整个数据集
 */
export const validateCelebritiesData = (data: any): Celebrity[] => {
  if (!data || !Array.isArray(data.celebrities)) {
    throw new Error('Invalid data format');
  }

  const validCelebrities = data.celebrities.filter(validateCelebrity);

  if (validCelebrities.length !== data.celebrities.length) {
    console.warn(
      `${data.celebrities.length - validCelebrities.length} invalid celebrities filtered out`
    );
  }

  return validCelebrities;
};
