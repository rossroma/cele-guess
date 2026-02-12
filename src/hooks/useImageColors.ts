import { useState, useEffect } from 'react';

interface ImageColors {
  primary: string;
  secondary: string;
}

// 基于字符串生成一致的颜色（伪随机但确定性的）
const generateColorsFromUrl = (url: string): ImageColors => {
  // 从 URL 生成哈希值
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  // 使用哈希值生成颜色
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360; // 相邻色调
  
  // 生成柔和的颜色（高亮度、中等饱和度）
  const saturation = 55 + (Math.abs(hash >> 8) % 25); // 55-80%
  const lightness = 55 + (Math.abs(hash >> 16) % 20); // 55-75%
  
  const primary = `hsl(${hue1}, ${saturation}%, ${lightness}%)`;
  const secondary = `hsl(${hue2}, ${saturation - 10}%, ${lightness + 5}%)`;
  
  return { primary, secondary };
};

export const useImageColors = (imageUrl?: string): ImageColors => {
  const [colors, setColors] = useState<ImageColors>({
    primary: '#667eea',
    secondary: '#764ba2'
  });

  useEffect(() => {
    if (!imageUrl) return;
    
    console.log('正在为图片生成颜色:', imageUrl);
    
    // 基于 URL 生成确定性的颜色
    // 这样每张图片都有独特的颜色，且切换时会变化
    const newColors = generateColorsFromUrl(imageUrl);
    console.log('生成的颜色:', newColors);
    
    setColors(newColors);
  }, [imageUrl]);

  return colors;
};
