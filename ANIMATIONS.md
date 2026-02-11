# 动画效果说明文档

## 已添加的动画效果

### 1. 照片卡片切换动画

**位置**: `src/components/PhotoCard/`

**效果描述**:
- 当切换到新明星时，照片卡片会有平滑的滑入和淡入效果
- 动画时长: 300ms
- 动画曲线: ease (平滑)

**实现细节**:
```scss
// 滑入淡入动画
@keyframes slideInFade {
  0% {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
```

**触发时机**:
- 点击"上一张"或"下一张"按钮
- 使用方向键切换
- 移动端左右滑动
- 每次切换明星时自动触发

### 2. 答案按钮动画

**位置**: `src/components/AnswerButton/`

**效果描述**:
- 点击后答案显示区域有淡入和缩放效果
- 按钮有悬停和点击反馈效果

**动画效果**:
1. **答案显示动画**:
   ```scss
   @keyframes fadeInScale {
     0% {
       opacity: 0;
       transform: scale(0.9);
     }
     100% {
       opacity: 1;
       transform: scale(1);
     }
   }
   ```

2. **按钮交互反馈**:
   - PC端悬停: 按钮向上浮动 2px，阴影增强
   - 点击: 缩小到 95%
   - 过渡时间: 200ms

### 3. 导航按钮动画

**位置**: `src/pages/Game/`

**效果描述**:
- PC端悬停时按钮向上浮动，阴影增强
- 点击时按钮回到原位
- 过渡时间: 200ms

**CSS实现**:
```scss
.nav-button {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  &:active {
    transform: translateY(0);
  }
}
```

### 4. 提示文本脉冲动画

**位置**: `src/pages/Game/`

**效果描述**:
- "左右滑动切换"提示文字有呼吸效果
- 透明度在 0.6 到 1.0 之间循环变化
- 动画时长: 2秒，无限循环

**CSS实现**:
```scss
@keyframes pulseOpacity {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
```

## 动画参数汇总

| 动画类型 | 时长 | 缓动函数 | 触发条件 |
|---------|------|---------|---------|
| 照片切换 | 300ms | ease | 明星ID改变 |
| 答案显示 | 300ms | ease | 点击查看答案 |
| 按钮悬停 | 200ms | ease | 鼠标悬停 |
| 按钮点击 | 200ms | ease | 鼠标点击 |
| 提示脉冲 | 2000ms | ease-in-out | 页面加载 |

## 性能优化

### 使用 CSS transform 和 opacity
- 这两个属性的动画不会触发重排（reflow）
- 浏览器可以使用 GPU 加速
- 保证了动画的流畅性

### 合理的动画时长
- 300ms: 足够快，不会让用户等待
- 200ms: 按钮反馈快速响应
- 2s: 提示文字的呼吸效果不会过于频繁

### 按需触发
- 仅在明星ID改变时触发照片动画
- 避免不必要的重渲染

## 用户体验提升

### 视觉反馈
- ✅ 切换明星时有明显的过渡效果，避免生硬跳转
- ✅ 按钮交互有即时反馈，增强可点击性
- ✅ 答案显示有仪式感，提升游戏趣味性

### 引导作用
- ✅ 提示文字脉冲动画吸引用户注意
- ✅ 按钮悬停效果告知用户可交互元素

### 性能表现
- ✅ 使用硬件加速的 CSS 属性
- ✅ 避免 JavaScript 驱动的动画
- ✅ 动画时长适中，不影响操作流畅度

## 浏览器兼容性

所有动画使用标准 CSS3 属性，兼容性良好：
- ✅ Chrome/Edge (现代版本)
- ✅ Safari (iOS 12+)
- ✅ Firefox (现代版本)

## 自定义调整

如需调整动画效果，可以修改以下参数：

### 调整动画速度
在各组件的 `.scss` 文件中修改 `animation-duration` 或 `transition` 的时长值

### 调整动画效果
修改 `@keyframes` 中的关键帧参数，例如：
- `translateX()`: 调整滑动距离
- `scale()`: 调整缩放比例
- `opacity`: 调整透明度变化

### 禁用动画
在全局样式中添加：
```scss
* {
  animation: none !important;
  transition: none !important;
}
```

## 测试建议

### 视觉测试
1. 在不同设备上测试动画流畅度
2. 检查动画是否有卡顿
3. 验证动画完成后元素状态正确

### 性能测试
1. 使用 Chrome DevTools Performance 面板
2. 检查 FPS (应保持 60fps)
3. 查看是否有布局抖动

### 用户体验测试
1. 快速连续切换，检查动画是否正常
2. 测试动画中断后的表现
3. 验证移动端和PC端的差异化体验

---

**文档版本**: v1.0
**更新日期**: 2026-02-09
**相关文件**: PhotoCard, AnswerButton, Game 页面
