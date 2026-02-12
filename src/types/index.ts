// 枚举值定义
export enum RegionEnum {
  MAINLAND = 1,
  HONGKONG = 2,
  TAIWAN = 3,
  JAPAN_KOREA = 4,
  OTHER = 5
}

export enum GenderEnum {
  MALE = 1,
  FEMALE = 2
}

export enum ProfessionEnum {
  FILM_ACTOR = 1,
  CROSSTALK_ACTOR = 2,
  STANDUP_COMEDIAN = 3
}

// 类型别名
export type Region = RegionEnum;
export type Gender = GenderEnum;
export type Profession = ProfessionEnum;

// 映射配置 - 枚举值到显示文本
export const REGION_LABELS: Record<RegionEnum, string> = {
  [RegionEnum.MAINLAND]: '内地',
  [RegionEnum.HONGKONG]: '香港',
  [RegionEnum.TAIWAN]: '台湾',
  [RegionEnum.JAPAN_KOREA]: '日韩',
  [RegionEnum.OTHER]: '其他'
};

export const GENDER_LABELS: Record<GenderEnum, string> = {
  [GenderEnum.MALE]: '男',
  [GenderEnum.FEMALE]: '女'
};

export const PROFESSION_LABELS: Record<ProfessionEnum, string> = {
  [ProfessionEnum.FILM_ACTOR]: '影视演员',
  [ProfessionEnum.CROSSTALK_ACTOR]: '相声演员',
  [ProfessionEnum.STANDUP_COMEDIAN]: '脱口秀演员'
};

// 数据实体接口
export interface Celebrity {
  id: string;
  name: string;
  photo: string;
  hdphoto?: string;
  region: Region;
  gender: Gender;
  profession: Profession;
}

export interface FilterOptions {
  regions: Region[];
  genders: Gender[];
  professions: Profession[];
}

export interface UserPreferences {
  lastFilters: FilterOptions;
  lastUpdated: number;
}
