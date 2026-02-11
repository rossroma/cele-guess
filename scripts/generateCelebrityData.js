import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const URL = 'https://www.xgccm.com/star?sex=0';
const OUTPUT_FILE = path.join(__dirname, '../data/celebrities.json');

/**
 * 解析HTML页面，提取明星数据
 */
async function parseCelebrityData() {
  try {
    console.log('正在获取数据...');

    // 获取HTML页面
    const response = await fetch(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML数据获取成功');

    // 使用cheerio解析HTML
    const $ = cheerio.load(html);
    const celebrities = [];

    // 解析每个li元素
    $('.star-zl-list ul li').each((index, element) => {
      const $li = $(element);
      const dataId = $li.attr('data-id');
      const $link = $li.find('a.mxbox');
      const href = $link.attr('href');
      const title = $link.attr('title');

      // 解析图片
      const $img = $li.find('.picbox img');
      const imgSrc = $img.attr('src') || $img.attr('data-original');
      const imgAlt = $img.attr('alt');

      // 解析明星名字
      const name = $li.find('.starname').text().trim();

      // 从title中提取演出费（如果有）
      let performanceFee = null;
      if (title) {
        const feeMatch = title.match(/商业演出费：(.+)/);
        if (feeMatch) {
          performanceFee = feeMatch[1].trim();
        }
      }

      // 构建完整的图片URL
      const fullImgUrl = imgSrc && imgSrc.startsWith('/')
        ? `https://www.xgccm.com${imgSrc}`
        : imgSrc;

      // 构建完整的详情URL
      const fullDetailUrl = href && href.startsWith('/')
        ? `https://www.xgccm.com${href}`
        : href;

      if (dataId && name) {
        celebrities.push({
          id: dataId,
          name: name,
          imageUrl: fullImgUrl,
          detailUrl: fullDetailUrl,
          performanceFee: performanceFee,
          gender: 'female' // 根据URL参数sex=0，这是女性明星
        });
      }
    });

    console.log(`成功解析 ${celebrities.length} 位明星数据`);

    return celebrities;
  } catch (error) {
    console.error('解析数据时出错:', error);
    throw error;
  }
}

/**
 * 保存数据到JSON文件
 */
async function saveCelebrityData(data) {
  try {
    // 确保目录存在
    const dir = path.dirname(OUTPUT_FILE);
    await fs.mkdir(dir, { recursive: true });

    // 如果文件已存在，读取现有数据
    let existingData = [];
    try {
      const existingContent = await fs.readFile(OUTPUT_FILE, 'utf-8');
      existingData = JSON.parse(existingContent);
      console.log(`读取到现有数据 ${existingData.length} 条`);
    } catch (error) {
      // 文件不存在或解析失败，使用空数组
      console.log('未找到现有数据文件，将创建新文件');
    }

    // 合并数据（根据ID去重）
    const existingIds = new Set(existingData.map(item => item.id));
    const newData = data.filter(item => !existingIds.has(item.id));
    const mergedData = [...existingData, ...newData];

    // 写入文件
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(mergedData, null, 2),
      'utf-8'
    );

    console.log(`数据已保存到 ${OUTPUT_FILE}`);
    console.log(`新增 ${newData.length} 条数据，总计 ${mergedData.length} 条数据`);

    return mergedData;
  } catch (error) {
    console.error('保存数据时出错:', error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('开始生成明星数据...\n');

    // 解析数据
    const celebrities = await parseCelebrityData();

    // 保存数据
    await saveCelebrityData(celebrities);

    console.log('\n✓ 数据生成完成！');
  } catch (error) {
    console.error('\n✗ 数据生成失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
