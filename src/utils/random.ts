import type { Celebrity } from '../types';

export const getRandomCelebrity = (
  celebrities: Celebrity[],
  excludeId?: string
): Celebrity | null => {
  if (celebrities.length === 0) return null;

  const availableCelebrities = excludeId
    ? celebrities.filter((c) => c.id !== excludeId)
    : celebrities;

  if (availableCelebrities.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableCelebrities.length);
  return availableCelebrities[randomIndex];
};

// Fisher-Yates 洗牌算法
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
