# 获取明星高清图片脚本

## 功能说明

这个脚本会自动遍历 `data/celebrities.json` 文件中的所有明星数据，使用无头浏览器访问星光传媒网站，获取每个明星的高清图片，并将图片URL添加到JSON数据中。

## 使用方法

### 1. 确保依赖已安装

```bash
npm install
```

### 2. 运行脚本

```bash
npm run fetch-hd-photos
```

或者直接运行：

```bash
node scripts/fetchHDPhotos.js
```

## 配置选项

在 `fetchHDPhotos.js` 文件顶部的 `CONFIG` 对象中可以调整以下参数：

- **inputFile**: 输入JSON文件路径（默认：`../data/celebrities.json`）
- **outputFile**: 输出JSON文件路径（默认：`../data/celebrities.json`）
- **baseUrl**: 明星详情页基础URL（默认：`https://www.xgccm.com/star/detail/`）
- **delayBetweenRequests**: 请求间隔时间（毫秒，默认：1000）
- **batchSize**: 每处理多少条数据保存一次（默认：10）
- **startIndex**: 从哪个索引开始处理（默认：0）

## 功能特性

- ✅ **断点续传**: 已经有 `hdphoto` 字段的明星会自动跳过
- ✅ **批次保存**: 每处理一定数量自动保存，避免数据丢失
- ✅ **详细日志**: 实时显示处理进度和结果
- ✅ **错误处理**: 遇到错误会继续处理下一条
- ✅ **速率限制**: 自动延迟请求，避免访问过快被封禁

## 数据格式

脚本会在每个明星对象中添加 `hdphoto` 字段：

```json
{
  "id": "5333",
  "name": "亚当·兰伯特",
  "photo": "https://www.xgccm.com/storage/images/...",
  "gender": null,
  "region": null,
  "hdphoto": "https://www.xgccm.com/storage/images/..." // 新增字段
}
```

## 注意事项

1. **网络连接**: 确保网络连接稳定
2. **执行时间**: 根据数据量，完整执行可能需要较长时间
3. **访问频率**: 建议不要过于频繁运行，避免对目标网站造成压力
4. **数据备份**: 建议在运行前备份 `celebrities.json` 文件

## 中断与恢复

如果脚本中断，可以：

1. 调整 `CONFIG.startIndex` 为上次处理到的索引
2. 或者直接重新运行，脚本会自动跳过已有 `hdphoto` 的数据

## 故障排除

### 浏览器启动失败

如果遇到 Puppeteer 浏览器启动失败，尝试：

```bash
# macOS
npx puppeteer browsers install chrome

# 或者安装完整版
npm install puppeteer --ignore-scripts
npx puppeteer browsers install chrome
```

### 图片获取失败

- 检查网络连接
- 检查目标网站是否可访问
- 增加 `delayBetweenRequests` 时间
- 检查目标网站HTML结构是否变化

## 示例输出

```
[2026-02-12 10:00:00] 📝 开始获取明星高清图片
[2026-02-12 10:00:00] 📝 成功读取 4202 条明星数据
[2026-02-12 10:00:01] 📝 正在启动浏览器...

[2026-02-12 10:00:02] 📝 [1/4202] 处理: 亚当·兰伯特 (ID: 5333)
[2026-02-12 10:00:02] 📝 正在访问: https://www.xgccm.com/star/detail/5333
[2026-02-12 10:00:03] ✅ 获取到图片: https://www.xgccm.com/storage/images/...

...

[2026-02-12 10:15:00] 📝 --- 批次保存 (10/4202) ---
[2026-02-12 10:15:00] ✅ 数据已保存到: ../data/celebrities.json
[2026-02-12 10:15:00] 📝 成功: 8, 失败: 1, 跳过: 1
```

## 许可

MIT
