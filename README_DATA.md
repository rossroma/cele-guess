# 明星数据生成脚本

这个脚本用于从 https://www.xgccm.com 网站抓取明星数据并保存到 JSON 文件中。

## 安装依赖

```bash
npm install
```

## 使用方法

```bash
npm run generate-data
```

## 脚本功能

- 从指定URL获取HTML页面
- 解析页面中的明星列表数据
- 提取明星的ID、姓名、图片URL、详情页URL和演出费
- 自动合并到现有的 JSON 文件中（根据ID去重）
- 保存到 `data/celebrities.json` 文件

## 数据格式

```json
[
  {
    "id": "7359",
    "name": "单依纯",
    "imageUrl": "https://www.xgccm.com/storage/attached/image/20211010/20211010204076347634.jpeg",
    "detailUrl": "https://www.xgccm.com/star/detail/7359",
    "performanceFee": "550万元",
    "gender": "female"
  }
]
```

## 配置

可以在 `scripts/generateCelebrityData.js` 中修改：

- `URL`: 要抓取的页面地址（可以修改sex参数获取不同性别的明星）
- `OUTPUT_FILE`: 输出的JSON文件路径
