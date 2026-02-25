import type { Celebrity } from '../types';
import { shuffleArray } from './random';

export const SCORE_FIRST_TRY = 3;
export const SCORE_SECOND_TRY = 1;
export const HIGH_SCORE_KEY = 'cele-guess-score-highscore';

export const getScoreForAttempts = (wrongAttempts: number, isCorrect: boolean): number => {
  if (!isCorrect) return 0;
  if (wrongAttempts === 0) return SCORE_FIRST_TRY;
  if (wrongAttempts === 1) return SCORE_SECOND_TRY;
  return 0;
};

export const getHighScore = (): number => {
  const stored = localStorage.getItem(HIGH_SCORE_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

export const saveHighScore = (score: number): boolean => {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
    return true;
  }
  return false;
};

/** 判断字符是否为中文汉字 */
const isChinese = (char: string): boolean => /[\u4e00-\u9fa5]/.test(char);

/** 判断字符是否为英文字母 */
const isEnglish = (char: string): boolean => /[a-zA-Z]/.test(char);

/** 判断姓名类型：'chinese' | 'english' | 'mixed' */
export type NameType = 'chinese' | 'english' | 'mixed';

export const getNameType = (name: string): NameType => {
  // 包含间隔符·或同时含有中英文，视为混杂
  if (name.includes('·') || name.includes('•')) return 'mixed';
  const hasChinese = [...name].some(isChinese);
  const hasEnglish = [...name].some(isEnglish);
  if (hasChinese && hasEnglish) return 'mixed';
  if (hasChinese) return 'chinese';
  if (hasEnglish) return 'english';
  return 'mixed'; // 纯符号/数字等也视为混杂
};

/**
 * 过滤可参与计分模式的明星：
 * - 去除混杂姓名（含·或中英混合）
 * - 去除超过 5 个字的姓名（太长，方格放不下）
 * - 去除只有 1 个字的姓名（太短，无意义）
 */
export const filterScorableCelebrities = (celebrities: Celebrity[]): Celebrity[] =>
  celebrities.filter((c) => {
    const type = getNameType(c.name);
    if (type === 'mixed') return false;
    const len = c.name.length;
    return len >= 2 && len <= 5;
  });

/**
 * 从所有明星姓名中抽取干扰字，生成指定大小的字符池。
 * - 必须包含当前明星姓名的所有字
 * - 干扰字与正确字语言类型一致（中文配中文、英文配英文）
 * - 过滤空白/特殊字符
 */
export const generateCharPool = (
  celebrity: Celebrity,
  allCelebrities: Celebrity[],
  poolSize: number = 27
): string[] => {
  const nameType = getNameType(celebrity.name);
  const correctChars = celebrity.name.split('').filter((c) => c.trim() !== '');
  const needed = poolSize - correctChars.length;

  // 按语言类型筛选干扰字来源：仅使用同类型且无混杂姓名的明星
  const isValidDistractorChar = (char: string): boolean => {
    if (char.trim() === '') return false;
    if (nameType === 'chinese') return isChinese(char);
    if (nameType === 'english') return isEnglish(char);
    return false;
  };

  const others = shuffleArray(
    allCelebrities.filter((c) => c.id !== celebrity.id && getNameType(c.name) === nameType)
  );

  const distractors: string[] = [];
  for (const other of others) {
    for (const char of other.name.split('')) {
      if (isValidDistractorChar(char)) {
        distractors.push(char);
      }
    }
    if (distractors.length >= needed * 5) break;
  }

  const shuffledDistractors = shuffleArray(distractors).slice(0, needed);

  // 若干扰字不足，用正确字中的字重复填充（保证总数）
  const pool = [...correctChars, ...shuffledDistractors];
  while (pool.length < poolSize) {
    pool.push(correctChars[Math.floor(Math.random() * correctChars.length)]);
  }

  return shuffleArray(pool);
};

/**
 * 从过滤后的明星列表随机选取指定数量的明星（不重复），自动排除混杂姓名
 */
export const pickRandomCelebrities = (
  celebrities: Celebrity[],
  count: number = 10
): Celebrity[] => {
  const scorable = filterScorableCelebrities(celebrities);
  if (scorable.length <= count) return shuffleArray(scorable);
  return shuffleArray(scorable).slice(0, count);
};
