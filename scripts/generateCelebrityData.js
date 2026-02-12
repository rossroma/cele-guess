import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const BASE_URL = 'https://www.xgccm.com/star';
const OUTPUT_FILE = path.join(__dirname, '../data/celebrities.json');
const PAGE_SIZE = 30; // 每页返回30条数据
const MAX_PAGES = 20; // 最大爬取页数
const IMAGE_LOAD_DELAY = 3000; // 等待图片加载的时间（毫秒），避免获取占位图
const IMAGE_STABLE_DELAY = 2000; // 等待图片稳定的时间（毫秒）

// 全局浏览器实例（复用以提高性能）
let browser = null;

/**
 * 初始化浏览器实例
 * @returns {Promise<Browser>}
 */
async function initBrowser() {
  if (!browser) {
    console.log('正在启动无头浏览器...');
    browser = await puppeteer.launch({
      headless: true, // 无头模式
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
    console.log('浏览器启动成功');
  }
  return browser;
}

/**
 * 关闭浏览器实例
 */
async function closeBrowser() {
  if (browser) {
    console.log('正在关闭浏览器...');
    await browser.close();
    browser = null;
    console.log('浏览器已关闭');
  }
}

/**
 * 使用 Puppeteer 无头浏览器获取页面数据并直接提取
 * @param {string} url - 请求URL
 * @param {string} sex - 性别参数
 * @param {string} diyu - 地域参数
 * @returns {Promise<Array>} 明星数据数组
 */
async function fetchWithPuppeteer(url, sex, diyu) {
  try {
    const browserInstance = await initBrowser();
    const page = await browserInstance.newPage();
    
    // 设置用户代理和视口大小
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 设置额外的请求头
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    });
    
    // 访问页面，等待网络空闲
    await page.goto(url, {
      waitUntil: 'networkidle2', // 等待网络空闲
      timeout: 30000 // 30秒超时
    });
    
    // 等待关键内容加载
    await page.waitForSelector('.star-zl-list ul li', {
      timeout: 10000
    }).catch(() => {
      console.log('警告: 未找到明星列表元素，可能页面结构已变化或页面为空');
    });
    
    // 滚动页面以触发懒加载图片
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 等待一段时间让图片加载（避免获取占位图）
    console.log(`等待图片加载 ${IMAGE_LOAD_DELAY}ms...`);
    await new Promise(resolve => setTimeout(resolve, IMAGE_LOAD_DELAY));
    
    // 滚回顶部
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    // 再等待一下确保所有图片都加载完成
    console.log(`等待图片稳定 ${IMAGE_STABLE_DELAY}ms...`);
    await new Promise(resolve => setTimeout(resolve, IMAGE_STABLE_DELAY));
    
    // 在浏览器上下文中提取数据
    const celebrities = await page.evaluate((sex, diyu) => {
      const items = [];
      const liElements = document.querySelectorAll('.star-zl-list ul li');
      
      liElements.forEach((li) => {
        const dataId = li.getAttribute('data-id');
        const img = li.querySelector('.picbox img');
        const imgSrc = img ? (img.getAttribute('src') || img.getAttribute('data-original')) : null;
        const nameElement = li.querySelector('.starname');
        const name = nameElement ? nameElement.textContent.trim() : '';
        
        // 构建完整的图片URL
        const fullImgUrl = imgSrc && imgSrc.startsWith('/')
          ? `https://www.xgccm.com${imgSrc}`
          : imgSrc;
        
        if (dataId && name) {
          items.push({
            id: dataId,
            name: name,
            photo: fullImgUrl,
            gender: null,
            region: null
          });
        }
      });
      
      return items;
    }, sex, diyu);
    
    // 关闭页面（但保留浏览器实例以供复用）
    await page.close();
    
    return celebrities;
  } catch (error) {
    throw new Error(`Puppeteer 获取页面失败: ${error.message}`);
  }
}

/**
 * 获取指定页码的明星数据
 * @param {number} page - 页码
 */
async function parseCelebrityData(page = 1) {
  try {
    // 构建带page参数的URL
    const url = `${BASE_URL}?page=${page}`;
    
    // 从URL中提取sex和diyu参数
    const urlObj = new URL(url);
    const sex = urlObj.searchParams.get('sex');
    const diyu = urlObj.searchParams.get('diyu');
    
    console.log(`正在获取第 ${page} 页数据...`);

    // 使用 Puppeteer 无头浏览器获取并提取数据
    const celebrities = await fetchWithPuppeteer(url, sex, diyu);
    console.log(`成功获取第 ${page} 页，共 ${celebrities.length} 位明星数据`);

    return celebrities;
  } catch (error) {
    console.error(`获取第 ${page} 页数据时出错:`, error);
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

    let page = 1;
    let allCelebrities = [];
    let hasMoreData = true;

    // 循环翻页，直到返回数据小于30条或达到最大页数
    while (hasMoreData && page <= MAX_PAGES) {
      const celebrities = await parseCelebrityData(page);
      
      if (celebrities.length === 0) {
        // 如果返回0条数据，停止翻页
        console.log(`第 ${page} 页返回0条数据，停止翻页`);
        hasMoreData = false;
      } else {
        allCelebrities = allCelebrities.concat(celebrities);
        
        // 检查是否达到最大页数
        if (page >= MAX_PAGES) {
          console.log(`已达到最大页数限制 (${MAX_PAGES} 页)，停止翻页`);
          hasMoreData = false;
        }
        // 如果返回数据小于30条，说明已经是最后一页
        else if (celebrities.length < PAGE_SIZE) {
          console.log(`第 ${page} 页返回 ${celebrities.length} 条数据（小于 ${PAGE_SIZE} 条），停止翻页`);
          hasMoreData = false;
        } else {
          // 继续翻页
          page++;
          // 添加短暂延迟，避免请求过快
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    console.log(`\n共获取 ${allCelebrities.length} 位明星数据`);

    // 保存数据
    await saveCelebrityData(allCelebrities);

    console.log('\n✓ 数据生成完成！');
    
    // 关闭浏览器
    await closeBrowser();
  } catch (error) {
    console.error('\n✗ 数据生成失败:', error);
    
    // 确保出错时也关闭浏览器
    await closeBrowser();
    
    process.exit(1);
  }
}

// 运行主函数
main();
