# 技术设计文档 - CeleGuess 明星猜猜看

## 1. 项目概述

### 1.1 项目定位
基于 React 的纯前端明星猜名小游戏，数据存储在本地 JSON 文件中，支持响应式布局。

### 1.2 技术栈选型

#### 核心框架
- **React 18.x** - 前端框架
- **React Router 6.x** - 路由管理
- **Vite** - 构建工具（快速开发体验）

#### UI 框架
- **Ant Design Mobile** - 移动端UI组件库
  - 成熟稳定，组件丰富
  - 支持主题定制
  - 优秀的移动端体验
- **Ant Design** - PC端降级方案
  - 与 Ant Design Mobile 风格统一
  - 自动响应式适配

#### 状态管理
- **Zustand** - 轻量级状态管理
  - 简单易用，无模板代码
  - 适合中小型项目
  - 内置 localStorage 持久化支持

#### 工具库
- **classnames** - 动态 className 管理
- **react-swipeable** - 手势滑动支持
- **lodash-es** - 工具函数库

#### 开发工具
- **TypeScript** - 类型安全
- **ESLint + Prettier** - 代码规范
- **Sass/SCSS** - CSS 预处理器

## 2. 项目架构

### 2.1 目录结构

```
celeguess/
├── public/
│   └── celebrities/          # 明星照片资源（统一存放）
│       ├── 001.jpg
│       ├── 002.jpg
│       ├── 003.jpg
│       └── ...
├── src/
│   ├── assets/              # 静态资源
│   │   ├── images/
│   │   └── styles/
│   │       └── global.scss
│   ├── components/          # 通用组件
│   │   ├── FilterPanel/    # 筛选面板
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   ├── PhotoCard/      # 照片卡片
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   ├── AnswerButton/   # 答案按钮
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   └── Layout/         # 布局组件
│   │       ├── index.tsx
│   │       └── index.scss
│   ├── pages/              # 页面组件
│   │   ├── Home/           # 开始页面
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   └── Game/           # 游戏页面
│   │       ├── index.tsx
│   │       └── index.scss
│   ├── data/               # 数据文件
│   │   └── celebrities.json  # 唯一的明星数据文件
│   ├── store/              # 状态管理
│   │   ├── useFilterStore.ts
│   │   └── useGameStore.ts
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useCelebrities.ts
│   │   ├── useSwipe.ts
│   │   └── useResponsive.ts
│   ├── utils/              # 工具函数
│   │   ├── filter.ts
│   │   ├── random.ts
│   │   ├── labelMapper.ts  # 枚举值映射工具
│   │   ├── dataValidator.ts # 数据验证工具
│   │   └── storage.ts
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── constants/          # 常量定义
│   │   └── labels.ts       # 枚举值映射配置
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.js
└── README.md
```

### 2.2 架构设计图

```
┌─────────────────────────────────────────┐
│           用户界面层 (UI Layer)           │
├─────────────────────────────────────────┤
│  Home Page  │  Game Page  │  Components │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│         状态管理层 (State Layer)          │
├─────────────────────────────────────────┤
│  Filter Store  │  Game Store  │  Cache  │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│         业务逻辑层 (Logic Layer)          │
├─────────────────────────────────────────┤
│  Custom Hooks  │  Utils  │  Filters     │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│         数据层 (Data Layer)              │
├─────────────────────────────────────────┤
│  JSON Data  │  LocalStorage  │  Images  │
└─────────────────────────────────────────┘
```

## 3. 核心模块设计

### 3.1 数据模型

#### 设计原则

**枚举值映射机制**

为了优化数据存储和提高性能，系统采用枚举值（数字）存储数据，通过映射配置转换为用户可读的文本：

- **存储层**：JSON 数据使用数字枚举值（1, 2, 3...）
- **展示层**：UI 显示使用映射后的中文文本（"男"、"女"等）
- **优势**：
  - 减少数据文件大小
  - 便于数据维护和迁移
  - 支持多语言扩展
  - 提高筛选性能

#### Celebrity 类型定义

```typescript
// src/types/index.ts

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
```

#### 数据文件结构

```json
// src/data/celebrities.json
{
  "version": "1.0",
  "lastUpdated": "2026-02-09",
  "celebrities": [
    {
      "id": "001",
      "name": "张艺兴",
      "photo": "/celebrities/001.jpg",
      "region": 1,
      "gender": 1,
      "profession": 1
    },
    {
      "id": "002",
      "name": "周星驰",
      "photo": "/celebrities/002.jpg",
      "region": 2,
      "gender": 1,
      "profession": 1
    },
    {
      "id": "003",
      "name": "杨幂",
      "photo": "/celebrities/003.jpg",
      "region": 1,
      "gender": 2,
      "profession": 1
    }
    // ... 更多数据
  ]
}
```

**字段说明**：
- `id`: 明星唯一标识符（字符串）
- `name`: 明星姓名
- `photo`: 照片路径（统一存放在 `/celebrities/` 目录下）
- `region`: 地区枚举值（1=内地, 2=香港, 3=台湾, 4=日韩, 5=其他）
- `gender`: 性别枚举值（1=男, 2=女）
- `profession`: 职业枚举值（1=影视演员, 2=相声演员, 3=脱口秀演员）

### 3.2 状态管理

#### 筛选状态 (useFilterStore)

```typescript
// src/store/useFilterStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterOptions } from '../types';

interface FilterState {
  filters: FilterOptions;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const defaultFilters: FilterOptions = {
  regions: [],
  genders: [],
  professions: []
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      hasActiveFilters: () => {
        const { filters } = get();
        return (
          filters.regions.length > 0 ||
          filters.genders.length > 0 ||
          filters.professions.length > 0
        );
      }
    }),
    {
      name: 'celeguess-filters', // localStorage key
      version: 1
    }
  )
);
```

#### 游戏状态 (useGameStore)

```typescript
// src/store/useGameStore.ts
import { create } from 'zustand';
import type { Celebrity } from '../types';

interface GameState {
  currentCelebrity: Celebrity | null;
  isAnswerVisible: boolean;
  viewedCount: number;
  setCurrentCelebrity: (celebrity: Celebrity | null) => void;
  showAnswer: () => void;
  hideAnswer: () => void;
  incrementViewedCount: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentCelebrity: null,
  isAnswerVisible: false,
  viewedCount: 0,

  setCurrentCelebrity: (celebrity) =>
    set({ currentCelebrity: celebrity, isAnswerVisible: false }),

  showAnswer: () => set({ isAnswerVisible: true }),

  hideAnswer: () => set({ isAnswerVisible: false }),

  incrementViewedCount: () =>
    set((state) => ({ viewedCount: state.viewedCount + 1 })),

  resetGame: () =>
    set({ currentCelebrity: null, isAnswerVisible: false, viewedCount: 0 })
}));
```

### 3.3 数据处理

#### 数据加载和筛选 Hook

```typescript
// src/hooks/useCelebrities.ts
import { useMemo } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import celebritiesData from '../data/celebrities.json';
import { filterCelebrities } from '../utils/filter';
import type { Celebrity } from '../types';

export const useCelebrities = () => {
  const { filters } = useFilterStore();

  const allCelebrities: Celebrity[] = useMemo(
    () => celebritiesData.celebrities,
    []
  );

  const filteredCelebrities = useMemo(
    () => filterCelebrities(allCelebrities, filters),
    [allCelebrities, filters]
  );

  return {
    allCelebrities,
    filteredCelebrities,
    totalCount: allCelebrities.length,
    filteredCount: filteredCelebrities.length
  };
};
```

#### 筛选工具函数

```typescript
// src/utils/filter.ts
import type { Celebrity, FilterOptions } from '../types';

export const filterCelebrities = (
  celebrities: Celebrity[],
  filters: FilterOptions
): Celebrity[] => {
  return celebrities.filter((celebrity) => {
    // 地区筛选
    if (filters.regions.length > 0 &&
        !filters.regions.includes(celebrity.region)) {
      return false;
    }

    // 性别筛选
    if (filters.genders.length > 0 &&
        !filters.genders.includes(celebrity.gender)) {
      return false;
    }

    // 职业筛选
    if (filters.professions.length > 0 &&
        !filters.professions.includes(celebrity.profession)) {
      return false;
    }

    return true;
  });
};
```

#### 随机选择工具函数

```typescript
// src/utils/random.ts
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
```

#### 枚举映射工具函数

```typescript
// src/utils/labelMapper.ts
import {
  RegionEnum,
  GenderEnum,
  ProfessionEnum,
  REGION_LABELS,
  GENDER_LABELS,
  PROFESSION_LABELS
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
```

### 3.4 响应式设计

#### 响应式 Hook

```typescript
// src/hooks/useResponsive.ts
import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  width: number;
}

export const useResponsive = (): ResponsiveInfo => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const deviceType: DeviceType = isMobile
    ? 'mobile'
    : isTablet
    ? 'tablet'
    : 'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    width
  };
};
```

### 3.5 手势交互

#### 滑动 Hook

```typescript
// src/hooks/useSwipe.ts
import { useSwipeable, SwipeEventData } from 'react-swipeable';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50
}: UseSwipeOptions) => {
  const handlers = useSwipeable({
    onSwipedLeft: (eventData: SwipeEventData) => {
      if (Math.abs(eventData.deltaX) > threshold) {
        onSwipeLeft?.();
      }
    },
    onSwipedRight: (eventData: SwipeEventData) => {
      if (Math.abs(eventData.deltaX) > threshold) {
        onSwipeRight?.();
      }
    },
    trackMouse: true, // 支持鼠标拖拽
    trackTouch: true,
    preventScrollOnSwipe: true
  });

  return handlers;
};
```

## 4. 页面设计

### 4.1 首页 (Home)

#### 功能需求
- 显示游戏标题和Logo
- 大号开始按钮
- 筛选入口按钮
- 显示当前筛选条件数量

#### 组件结构

```typescript
// src/pages/Home/index.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge } from 'antd-mobile';
import { FilterOutline } from 'antd-mobile-icons';
import FilterPanel from '../../components/FilterPanel';
import { useFilterStore } from '../../store/useFilterStore';
import { useCelebrities } from '../../hooks/useCelebrities';
import './index.scss';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [filterVisible, setFilterVisible] = useState(false);
  const { hasActiveFilters } = useFilterStore();
  const { filteredCount, totalCount } = useCelebrities();

  const handleStart = () => {
    if (filteredCount === 0) {
      // 提示无可用数据
      return;
    }
    navigate('/game');
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">CeleGuess</h1>
        <p className="home-subtitle">明星猜猜看</p>
      </div>

      <div className="home-content">
        <Button
          className="start-button"
          size="large"
          color="primary"
          onClick={handleStart}
        >
          开始游戏
        </Button>

        <Badge content={hasActiveFilters() ? '•' : null}>
          <Button
            className="filter-button"
            fill="outline"
            onClick={() => setFilterVisible(true)}
          >
            <FilterOutline /> 筛选条件
          </Button>
        </Badge>

        <div className="stats">
          可玩明星: {filteredCount} / {totalCount}
        </div>
      </div>

      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </div>
  );
};

export default Home;
```

### 4.2 游戏页 (Game)

#### 功能需求
- 显示明星照片
- 答案按钮
- 左右切换功能
- 返回首页按钮
- 支持滑动切换

#### 组件结构

```typescript
// src/pages/Game/index.tsx
import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Toast } from 'antd-mobile';
import { LeftOutline, RightOutline } from 'antd-mobile-icons';
import PhotoCard from '../../components/PhotoCard';
import AnswerButton from '../../components/AnswerButton';
import { useGameStore } from '../../store/useGameStore';
import { useCelebrities } from '../../hooks/useCelebrities';
import { useSwipe } from '../../hooks/useSwipe';
import { useResponsive } from '../../hooks/useResponsive';
import { getRandomCelebrity } from '../../utils/random';
import './index.scss';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { filteredCelebrities } = useCelebrities();
  const {
    currentCelebrity,
    isAnswerVisible,
    viewedCount,
    setCurrentCelebrity,
    showAnswer,
    incrementViewedCount
  } = useGameStore();

  // 加载随机明星
  const loadRandomCelebrity = useCallback(() => {
    const celebrity = getRandomCelebrity(
      filteredCelebrities,
      currentCelebrity?.id
    );

    if (celebrity) {
      setCurrentCelebrity(celebrity);
      incrementViewedCount();
    } else {
      Toast.show({
        content: '没有更多明星了',
        position: 'top'
      });
    }
  }, [filteredCelebrities, currentCelebrity, setCurrentCelebrity, incrementViewedCount]);

  // 初始化加载
  useEffect(() => {
    if (!currentCelebrity) {
      loadRandomCelebrity();
    }
  }, [currentCelebrity, loadRandomCelebrity]);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        loadRandomCelebrity();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (!isAnswerVisible) {
          showAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnswerVisible, showAnswer, loadRandomCelebrity]);

  // 滑动手势
  const swipeHandlers = useSwipe({
    onSwipeLeft: loadRandomCelebrity,
    onSwipeRight: loadRandomCelebrity
  });

  const handleBack = () => {
    navigate('/');
  };

  if (!currentCelebrity) {
    return <div className="game-loading">加载中...</div>;
  }

  return (
    <div className="game-page" {...swipeHandlers}>
      <div className="game-header">
        <Button
          fill="none"
          onClick={handleBack}
          className="back-button"
        >
          <LeftOutline /> 返回
        </Button>
        <span className="viewed-count">已查看: {viewedCount}</span>
      </div>

      <div className="game-content">
        <PhotoCard celebrity={currentCelebrity} />

        <AnswerButton
          name={currentCelebrity.name}
          isVisible={isAnswerVisible}
          onShow={showAnswer}
        />

        {!isMobile && (
          <div className="navigation-buttons">
            <Button
              className="nav-button prev"
              shape="rounded"
              onClick={loadRandomCelebrity}
            >
              <LeftOutline /> 上一张
            </Button>
            <Button
              className="nav-button next"
              shape="rounded"
              onClick={loadRandomCelebrity}
            >
              下一张 <RightOutline />
            </Button>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="swipe-hint">
          左右滑动切换
        </div>
      )}
    </div>
  );
};

export default Game;
```

## 5. 组件设计

### 5.1 筛选面板 (FilterPanel)

```typescript
// src/components/FilterPanel/index.tsx
import React from 'react';
import { Popup, Checkbox, Button, Space } from 'antd-mobile';
import { useFilterStore } from '../../store/useFilterStore';
import {
  RegionEnum,
  GenderEnum,
  ProfessionEnum,
  REGION_LABELS,
  GENDER_LABELS,
  PROFESSION_LABELS
} from '../../types';
import './index.scss';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ visible, onClose }) => {
  const { filters, setFilters, resetFilters } = useFilterStore();

  // 获取所有枚举值
  const regionOptions = Object.values(RegionEnum).filter(v => typeof v === 'number') as RegionEnum[];
  const genderOptions = Object.values(GenderEnum).filter(v => typeof v === 'number') as GenderEnum[];
  const professionOptions = Object.values(ProfessionEnum).filter(v => typeof v === 'number') as ProfessionEnum[];

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{ minHeight: '50vh' }}
    >
      <div className="filter-panel">
        <div className="filter-header">
          <h3>筛选条件</h3>
          <Button size="small" fill="none" onClick={resetFilters}>
            重置
          </Button>
        </div>

        <div className="filter-section">
          <h4>地区</h4>
          <Checkbox.Group
            value={filters.regions}
            onChange={(val) => setFilters({ regions: val as RegionEnum[] })}
          >
            <Space direction="vertical">
              {regionOptions.map((region) => (
                <Checkbox key={region} value={region}>
                  {REGION_LABELS[region]}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>

        <div className="filter-section">
          <h4>性别</h4>
          <Checkbox.Group
            value={filters.genders}
            onChange={(val) => setFilters({ genders: val as GenderEnum[] })}
          >
            <Space>
              {genderOptions.map((gender) => (
                <Checkbox key={gender} value={gender}>
                  {GENDER_LABELS[gender]}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>

        <div className="filter-section">
          <h4>职业</h4>
          <Checkbox.Group
            value={filters.professions}
            onChange={(val) => setFilters({ professions: val as ProfessionEnum[] })}
          >
            <Space direction="vertical">
              {professionOptions.map((profession) => (
                <Checkbox key={profession} value={profession}>
                  {PROFESSION_LABELS[profession]}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>

        <div className="filter-footer">
          <Button block color="primary" onClick={onClose}>
            确认
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default FilterPanel;
```

### 5.2 照片卡片 (PhotoCard)

```typescript
// src/components/PhotoCard/index.tsx
import React, { useState } from 'react';
import { Image, SpinLoading } from 'antd-mobile';
import type { Celebrity } from '../../types';
import './index.scss';

interface PhotoCardProps {
  celebrity: Celebrity;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ celebrity }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="photo-card">
      {loading && (
        <div className="photo-loading">
          <SpinLoading color="primary" />
        </div>
      )}

      {error ? (
        <div className="photo-error">
          图片加载失败
        </div>
      ) : (
        <Image
          src={celebrity.photo}
          alt={celebrity.name}
          fit="contain"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
};

export default PhotoCard;
```

### 5.3 答案按钮 (AnswerButton)

```typescript
// src/components/AnswerButton/index.tsx
import React from 'react';
import { Button } from 'antd-mobile';
import { EyeOutline } from 'antd-mobile-icons';
import './index.scss';

interface AnswerButtonProps {
  name: string;
  isVisible: boolean;
  onShow: () => void;
}

const AnswerButton: React.FC<AnswerButtonProps> = ({
  name,
  isVisible,
  onShow
}) => {
  return (
    <div className="answer-button-container">
      {isVisible ? (
        <div className="answer-display">
          <h2 className="celebrity-name">{name}</h2>
        </div>
      ) : (
        <Button
          className="reveal-button"
          size="large"
          color="primary"
          onClick={onShow}
        >
          <EyeOutline /> 查看答案
        </Button>
      )}
    </div>
  );
};

export default AnswerButton;
```

## 6. 样式设计

### 6.1 全局样式

```scss
// src/assets/styles/global.scss

// 颜色主题
$primary-color: #1677ff;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #ff4d4f;
$text-color: #333;
$text-secondary: #666;
$bg-color: #f5f5f5;
$border-color: #d9d9d9;

// 断点
$breakpoint-mobile: 768px;
$breakpoint-tablet: 1024px;

// 间距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// 圆角
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 16px;

// 阴影
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
$shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);

// 全局重置
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  color: $text-color;
  background-color: $bg-color;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// 容器
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;

  @media (min-width: $breakpoint-tablet) {
    padding: 0 $spacing-xl;
  }
}

// 响应式工具类
.mobile-only {
  @media (min-width: $breakpoint-mobile) {
    display: none !important;
  }
}

.desktop-only {
  @media (max-width: $breakpoint-mobile - 1) {
    display: none !important;
  }
}
```

### 6.2 页面样式示例

```scss
// src/pages/Home/index.scss
@import '../../assets/styles/global.scss';

.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: $spacing-xl $spacing-md;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .home-header {
    text-align: center;
    margin-bottom: $spacing-xl * 2;

    .home-title {
      font-size: 48px;
      font-weight: bold;
      color: white;
      margin-bottom: $spacing-sm;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);

      @media (min-width: $breakpoint-mobile) {
        font-size: 64px;
      }
    }

    .home-subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.9);

      @media (min-width: $breakpoint-mobile) {
        font-size: 24px;
      }
    }
  }

  .home-content {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;

    .start-button {
      height: 60px;
      font-size: 20px;
      font-weight: bold;
      border-radius: $border-radius-lg;
      box-shadow: $shadow-lg;

      @media (min-width: $breakpoint-mobile) {
        height: 70px;
        font-size: 24px;
      }
    }

    .filter-button {
      height: 48px;
      border-radius: $border-radius-md;
      background: white;
    }

    .stats {
      text-align: center;
      color: white;
      font-size: 14px;
      opacity: 0.8;
    }
  }
}
```

## 7. 性能优化

### 7.1 图片优化
- 使用 WebP 格式（降级 JPEG/PNG）
- 图片懒加载
- 响应式图片（不同设备不同尺寸）
- CDN 加速

### 7.2 代码优化
- 路由懒加载
- 组件按需引入
- 使用 useMemo 和 useCallback 避免不必要的重渲染
- 虚拟列表（如果数据量大）

### 7.3 缓存策略
- Service Worker 缓存静态资源
- LocalStorage 缓存用户偏好
- 图片浏览器缓存

### 7.4 数据验证

为确保 JSON 数据的正确性，建议实现数据验证工具：

```typescript
// src/utils/dataValidator.ts
import { RegionEnum, GenderEnum, ProfessionEnum } from '../types';
import type { Celebrity } from '../types';

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
  const validRegions = Object.values(RegionEnum).filter(v => typeof v === 'number');
  const validGenders = Object.values(GenderEnum).filter(v => typeof v === 'number');
  const validProfessions = Object.values(ProfessionEnum).filter(v => typeof v === 'number');

  if (!validRegions.includes(celebrity.region)) {
    console.error('Invalid region', celebrity);
    return false;
  }

  if (!validGenders.includes(celebrity.gender)) {
    console.error('Invalid gender', celebrity);
    return false;
  }

  if (!validProfessions.includes(celebrity.profession)) {
    console.error('Invalid profession', celebrity);
    return false;
  }

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
```

在加载数据时使用验证：

```typescript
// src/hooks/useCelebrities.ts
import { useMemo } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import celebritiesData from '../data/celebrities.json';
import { filterCelebrities } from '../utils/filter';
import { validateCelebritiesData } from '../utils/dataValidator';
import type { Celebrity } from '../types';

export const useCelebrities = () => {
  const { filters } = useFilterStore();

  const allCelebrities: Celebrity[] = useMemo(
    () => validateCelebritiesData(celebritiesData),
    []
  );

  const filteredCelebrities = useMemo(
    () => filterCelebrities(allCelebrities, filters),
    [allCelebrities, filters]
  );

  return {
    allCelebrities,
    filteredCelebrities,
    totalCount: allCelebrities.length,
    filteredCount: filteredCelebrities.length
  };
};
```

### 7.5 构建优化

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-mobile': ['antd-mobile'],
          'utils': ['lodash-es']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000
  }
});
```

## 8. 用户偏好缓存

### 8.1 缓存内容
- 筛选条件
- 最后访问时间
- 已查看明星数量（可选）

### 8.2 实现方案

通过 Zustand 的 persist 中间件自动实现：

```typescript
// 在 useFilterStore 中已实现
persist(
  (set, get) => ({...}),
  {
    name: 'celeguess-filters', // localStorage key
    version: 1,
    // 可添加迁移逻辑
    migrate: (persistedState: any, version: number) => {
      if (version === 0) {
        // 版本迁移逻辑
      }
      return persistedState;
    }
  }
)
```

### 8.3 数据清理策略
- 30天未访问自动清理
- 提供手动清除选项
- 版本升级时的数据迁移

## 9. 测试策略

### 9.1 单元测试
- 工具函数测试（filter, random）
- Store 测试
- Hook 测试

### 9.2 组件测试
- 快照测试
- 交互测试
- 响应式测试

### 9.3 E2E 测试
- 完整游戏流程
- 筛选功能
- 移动端手势

### 9.4 测试工具
- Vitest - 单元测试
- React Testing Library - 组件测试
- Playwright - E2E 测试

## 10. 部署方案

### 10.1 静态部署
推荐平台：
- **Vercel** - 零配置，自动部署
- **Netlify** - 简单易用
- **GitHub Pages** - 免费托管
- **Cloudflare Pages** - 全球 CDN

### 10.2 构建命令

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,scss}\""
  }
}
```

### 10.3 环境变量

```bash
# .env.production
VITE_APP_TITLE=CeleGuess
VITE_CDN_URL=https://cdn.example.com
```

## 11. 开发流程

### 11.1 初始化项目

```bash
# 创建项目
npm create vite@latest celeguess -- --template react-ts

# 安装依赖
npm install react-router-dom zustand antd-mobile
npm install react-swipeable classnames lodash-es
npm install -D sass @types/lodash-es

# 启动开发服务器
npm run dev
```

### 11.2 开发顺序

1. **Phase 1: 基础架构（2-3天）**
   - 项目初始化
   - 目录结构搭建
   - 路由配置
   - 全局样式

2. **Phase 2: 数据层（1-2天）**
   - 类型定义
   - JSON 数据准备
   - Store 实现
   - 工具函数

3. **Phase 3: 组件开发（3-4天）**
   - 通用组件
   - FilterPanel
   - PhotoCard
   - AnswerButton

4. **Phase 4: 页面开发（2-3天）**
   - Home 页面
   - Game 页面
   - 响应式适配

5. **Phase 5: 交互优化（2-3天）**
   - 手势支持
   - 动画效果
   - 键盘支持

6. **Phase 6: 测试和优化（2-3天）**
   - 功能测试
   - 性能优化
   - Bug 修复

7. **Phase 7: 部署（1天）**
   - 构建优化
   - 部署上线
   - 文档完善

### 11.3 Git 工作流

```bash
# 主分支
main - 生产环境
develop - 开发环境

# 功能分支
feature/home-page
feature/game-page
feature/filter-panel

# 提交规范
feat: 新功能
fix: 修复bug
style: 样式调整
refactor: 重构
docs: 文档
test: 测试
chore: 构建/工具
```

## 12. 注意事项

### 12.1 性能
- 图片优化至关重要
- 避免过度渲染
- 合理使用缓存

### 12.2 兼容性
- 测试主流浏览器
- iOS Safari 手势冲突处理
- Android 触摸延迟优化

### 12.3 用户体验
- 加载状态反馈
- 错误处理友好
- 响应式布局流畅

### 12.4 枚举值使用最佳实践

**为什么使用枚举值？**

1. **数据一致性**：使用数字枚举避免字符串拼写错误
2. **性能优化**：数字比较比字符串比较更快
3. **存储优化**：JSON 文件大小更小
4. **国际化友好**：易于扩展多语言支持
5. **类型安全**：TypeScript 提供编译时类型检查

**使用示例**：

```typescript
// ❌ 错误：直接使用字符串（容易出错）
if (celebrity.region === '内地') { }

// ✅ 正确：使用枚举值
if (celebrity.region === RegionEnum.MAINLAND) { }

// ✅ 正确：在UI层使用映射
<span>{REGION_LABELS[celebrity.region]}</span>
```

**注意事项**：
- JSON 数据中始终使用数字枚举值（1, 2, 3...）
- UI 展示时使用 LABELS 映射获取显示文本
- 避免硬编码显示文本，统一使用映射配置
- 添加新的筛选条件时，需要同步更新枚举定义和映射配置

### 12.5 数据管理
- **统一数据源**：所有明星数据存储在单一 JSON 文件中
- **照片命名规范**：使用明星ID作为文件名（如：001.jpg, 002.jpg）
- **枚举值一致性**：确保 JSON 数据中的枚举值与类型定义保持一致
- **JSON 数据校验**：开发工具验证数据格式和枚举值的正确性
- **数据备份策略**：定期备份 celebrities.json 文件

## 13. 未来扩展

### 13.1 功能扩展
- 答题模式（选择题）
- 计时挑战
- 成就系统
- 分享功能

### 13.2 技术扩展
- PWA 支持
- 离线模式
- 后端 API 接入
- 数据分析

### 13.3 内容扩展
- 更多明星数据
- 多语言支持
- 主题定制
- 音效支持

---

**文档版本**: v1.0
**创建日期**: 2026-02-09
**技术负责人**: [待填写]
**状态**: 待评审
