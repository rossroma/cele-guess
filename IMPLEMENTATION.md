# CeleGuess 实现说明

## 项目概述

CeleGuess 是一款基于 React + TypeScript 的明星猜猜看小游戏，完全按照 PRD 和设计文档实现。

## 已实现的功能

### 核心功能 (P0)

✅ **游戏开始页面**
- 显示游戏标题和副标题
- 大按钮设计，便于点击
- 响应式布局，适配移动端和PC端

✅ **筛选功能**
- 地区筛选：内地、香港、台湾、日韩、其他
- 性别筛选：男、女
- 职业筛选：影视演员、相声演员、脱口秀演员
- 支持多选
- 显示已选择的筛选条件标记
- 提供重置筛选功能
- 筛选条件持久化到 localStorage

✅ **照片展示**
- 随机显示明星照片
- 照片加载动画
- 错误处理
- 响应式尺寸

✅ **答案按钮**
- 未点击状态显示"查看答案"
- 点击后显示明星姓名
- 样式变化表示已查看

✅ **切换功能**
- 移动端：左右滑动切换
- PC端：方向键支持、鼠标点击按钮
- 切换后自动重置答案状态
- 平滑过渡

✅ **返回功能**
- 游戏页面提供返回按钮
- 可重新设置筛选条件

### 技术实现亮点

#### 1. 枚举值映射机制
```typescript
// 数据存储使用数字枚举
{
  "region": 1,  // 而不是 "内地"
  "gender": 1,  // 而不是 "男"
  "profession": 1  // 而不是 "影视演员"
}

// UI层使用映射配置
REGION_LABELS[1] // => "内地"
```

**优势**：
- 减小数据文件大小
- 提高筛选性能
- 便于国际化扩展
- 类型安全

#### 2. 状态管理
使用 Zustand 进行轻量级状态管理：
- `useFilterStore`: 筛选条件状态，支持持久化
- `useGameStore`: 游戏状态（当前明星、答案可见性、查看计数）

#### 3. 自定义 Hooks
- `useCelebrities`: 数据加载和筛选
- `useSwipe`: 手势支持
- `useResponsive`: 响应式判断

#### 4. 数据验证
实现了完整的数据验证逻辑：
- 验证必需字段
- 验证枚举值有效性
- 过滤无效数据
- 开发时警告

#### 5. 响应式设计
- 移动端优先
- 断点：< 768px (移动端)、768-1024px (平板)、> 1024px (PC端)
- 不同设备不同交互方式

## 项目结构

```
CeleGuess/
├── public/
│   └── celebrities/          # 明星照片（需要添加真实照片）
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── global.scss   # 全局样式变量
│   ├── components/
│   │   ├── AnswerButton/     # 答案按钮组件
│   │   ├── FilterPanel/      # 筛选面板组件
│   │   └── PhotoCard/        # 照片卡片组件
│   ├── data/
│   │   └── celebrities.json  # 明星数据（示例数据）
│   ├── hooks/
│   │   ├── useCelebrities.ts # 数据加载 Hook
│   │   ├── useResponsive.ts  # 响应式 Hook
│   │   └── useSwipe.ts       # 手势 Hook
│   ├── pages/
│   │   ├── Game/            # 游戏页面
│   │   └── Home/            # 首页
│   ├── store/
│   │   ├── useFilterStore.ts # 筛选状态
│   │   └── useGameStore.ts   # 游戏状态
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── utils/
│   │   ├── dataValidator.ts # 数据验证
│   │   ├── filter.ts        # 筛选逻辑
│   │   ├── labelMapper.ts   # 枚举映射
│   │   └── random.ts        # 随机选择
│   ├── App.tsx              # 路由配置
│   └── main.tsx             # 入口文件
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 使用说明

### 开发环境运行

1. 安装依赖（已完成）：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 访问 http://localhost:3000

### 添加真实明星照片

当前使用的是占位符，需要添加真实照片：

1. 准备照片：
   - 格式：JPG/PNG
   - 尺寸：建议 800x800px 或更大
   - 文件大小：< 200KB（需压缩）

2. 命名规则：使用明星ID作为文件名
   - 001.jpg
   - 002.jpg
   - ...

3. 放置位置：`public/celebrities/` 目录

4. 更新数据：在 `src/data/celebrities.json` 中添加或修改数据

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录，可以部署到任何静态服务器。

## 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **React Router 6** - 路由管理
- **Zustand** - 状态管理
- **Ant Design Mobile** - UI组件库
- **SCSS** - 样式预处理
- **React Swipeable** - 手势支持

## 性能优化

1. **代码分割**：使用 Vite 自动代码分割
2. **懒加载**：图片懒加载
3. **缓存**：localStorage 缓存筛选条件
4. **优化打包**：分离 vendor chunks

## 浏览器兼容性

- Chrome (最新版及前2个版本) ✅
- Safari (iOS 12+) ✅
- Firefox (最新版及前2个版本) ✅
- Edge (最新版) ✅

## 下一步工作

### 必须完成
1. 添加真实明星照片（至少50张）
2. 补充完整的明星数据

### 可选优化 (P1/P2)
1. 添加切换动画效果
2. 实现游戏统计功能
3. 添加收藏功能
4. 实现分享功能
5. PWA 支持（离线使用）
6. 性能监控和埋点

## 部署建议

### 静态托管平台
- **Vercel**: 零配置，自动部署
- **Netlify**: 简单易用
- **GitHub Pages**: 免费托管
- **Cloudflare Pages**: 全球 CDN

### 部署步骤（以 Vercel 为例）
1. 注册 Vercel 账号
2. 连接 GitHub 仓库
3. 自动检测 Vite 配置
4. 一键部署

## 常见问题

### Q: 为什么使用枚举值而不是直接存储文本？
A:
- 减小数据文件大小
- 便于维护（修改显示文本不需要改数据）
- 支持国际化
- 提高筛选性能

### Q: 如何添加新的筛选维度？
A:
1. 在 `src/types/index.ts` 添加新的枚举类型
2. 更新 `Celebrity` 接口
3. 在 `FilterOptions` 添加新字段
4. 更新筛选逻辑
5. 更新 UI 组件

### Q: 为什么选择 Ant Design Mobile？
A:
- 成熟稳定
- 组件丰富
- 优秀的移动端体验
- 支持主题定制
- 与 Ant Design 风格统一

## 联系方式

如有问题，请提交 GitHub Issue。
