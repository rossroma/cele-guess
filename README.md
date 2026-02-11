# CeleGuess - 明星猜猜看

一款轻量级的网页小游戏，通过展示明星照片让用户猜测明星姓名，适用于移动端和PC端。

## 功能特性

- **照片展示**: 随机显示明星照片
- **答案查看**: 点击按钮查看明星姓名
- **筛选功能**: 支持按地区、性别、职业筛选
- **响应式设计**: 完美适配移动端和PC端
- **手势支持**: 移动端支持左右滑动切换
- **键盘支持**: PC端支持方向键和空格键操作

## 技术栈

- React 18
- TypeScript
- Vite
- React Router 6
- Zustand (状态管理)
- Ant Design Mobile (UI组件)
- SCSS (样式)
- React Swipeable (手势支持)

## 项目结构

```
celeguess/
├── public/
│   └── celebrities/          # 明星照片资源
├── src/
│   ├── assets/              # 静态资源
│   │   └── styles/          # 全局样式
│   ├── components/          # 通用组件
│   │   ├── FilterPanel/    # 筛选面板
│   │   ├── PhotoCard/      # 照片卡片
│   │   └── AnswerButton/   # 答案按钮
│   ├── pages/              # 页面组件
│   │   ├── Home/           # 开始页面
│   │   └── Game/           # 游戏页面
│   ├── data/               # 数据文件
│   │   └── celebrities.json # 明星数据
│   ├── store/              # 状态管理
│   ├── hooks/              # 自定义 Hooks
│   ├── utils/              # 工具函数
│   └── types/              # TypeScript 类型定义
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 数据格式

明星数据存储在 `src/data/celebrities.json` 文件中，使用枚举值格式：

```json
{
  "id": "001",
  "name": "明星姓名",
  "photo": "/celebrities/001.jpg",
  "region": 1,     // 1=内地, 2=香港, 3=台湾, 4=日韩, 5=其他
  "gender": 1,     // 1=男, 2=女
  "profession": 1  // 1=影视演员, 2=相声演员, 3=脱口秀演员
}
```

### 添加新明星

1. 将照片放入 `public/celebrities/` 目录，命名为 `{id}.jpg`
2. 在 `src/data/celebrities.json` 中添加对应的数据条目
3. 确保使用正确的枚举值

## 游戏操作

### 移动端
- 左右滑动：切换照片
- 点击"查看答案"：显示明星姓名
- 点击"筛选条件"：打开筛选面板

### PC端
- 方向键左/右：切换照片
- 空格键/回车键：查看答案
- 点击按钮：同移动端操作

## 浏览器兼容性

- Chrome (最新版及前2个版本)
- Safari (iOS 12+)
- Firefox (最新版及前2个版本)
- Edge (最新版)

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
