import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

// 获取 __dirname (ES 模块中需要手动构建)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  inputFile: path.join(__dirname, '../data/celebrities.json'),
  outputFile: path.join(__dirname, '../data/celebrities.json'),
  baseUrl: 'https://www.xgccm.com/star/detail/',
  delayBetweenRequests: 1000, // 请求间隔，避免频繁访问
  batchSize: 10, // 每处理10个保存一次
  startIndex: 0, // 从哪个索引开始
};

// 日志函数
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleString('zh-CN');
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }[type] || '📝';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 从页面获取高清图片URL
async function fetchHDPhoto(page, id) {
  try {
    const url = `${CONFIG.baseUrl}${id}`;
    log(`正在访问: ${url}`);
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 等待图片加载
    await page.waitForSelector('.star-detail-l-pic img', { timeout: 10000 });

    // 提取图片URL
    const photoUrl = await page.evaluate(() => {
      const img = document.querySelector('.star-detail-l-pic img');
      if (img) {
        // 优先获取 src，如果没有则获取 data-original
        return img.getAttribute('src') || img.getAttribute('data-original');
      }
      return null;
    });

    if (photoUrl) {
      // 处理相对路径
      let fullUrl = photoUrl.trim();
      if (fullUrl.startsWith('/')) {
        fullUrl = `https://www.xgccm.com${fullUrl}`;
      }
      log(`获取到图片: ${fullUrl}`, 'success');
      return fullUrl;
    } else {
      log(`未找到图片`, 'warning');
      return null;
    }
  } catch (error) {
    log(`获取图片失败: ${error.message}`, 'error');
    return null;
  }
}

// 保存数据到文件
function saveData(data) {
  try {
    fs.writeFileSync(
      CONFIG.outputFile,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    log(`数据已保存到: ${CONFIG.outputFile}`, 'success');
    return true;
  } catch (error) {
    log(`保存数据失败: ${error.message}`, 'error');
    return false;
  }
}

// 主函数
async function main() {
  log('========================================');
  log('开始获取明星高清图片');
  log('========================================');

  // 读取JSON文件
  let celebrities;
  try {
    const data = fs.readFileSync(CONFIG.inputFile, 'utf8');
    celebrities = JSON.parse(data);
    log(`成功读取 ${celebrities.length} 条明星数据`);
  } catch (error) {
    log(`读取文件失败: ${error.message}`, 'error');
    return;
  }

  // 启动浏览器
  log('正在启动浏览器...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // 设置用户代理
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 });

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    // 遍历所有明星
    for (let i = CONFIG.startIndex; i < celebrities.length; i++) {
      const celebrity = celebrities[i];
      
      log(`\n[${i + 1}/${celebrities.length}] 处理: ${celebrity.name} (ID: ${celebrity.id})`);

      // 如果已经有 hdphoto 字段，跳过
      if (celebrity.hdphoto) {
        log(`已有高清图片，跳过`, 'warning');
        skipCount++;
        continue;
      }

      // 获取高清图片
      const hdphoto = await fetchHDPhoto(page, celebrity.id);
      
      if (hdphoto) {
        celebrity.hdphoto = hdphoto;
        successCount++;
      } else {
        failCount++;
      }

      // 每处理一定数量保存一次
      if ((i + 1) % CONFIG.batchSize === 0) {
        log(`\n--- 批次保存 (${i + 1}/${celebrities.length}) ---`);
        saveData(celebrities);
        log(`成功: ${successCount}, 失败: ${failCount}, 跳过: ${skipCount}`);
      }

      // 延迟，避免请求过快
      if (i < celebrities.length - 1) {
        await delay(CONFIG.delayBetweenRequests);
      }
    }

    // 最终保存
    log('\n--- 最终保存 ---');
    saveData(celebrities);

    log('\n========================================');
    log('处理完成!');
    log(`总计: ${celebrities.length} 条`);
    log(`成功: ${successCount} 条`);
    log(`失败: ${failCount} 条`);
    log(`跳过: ${skipCount} 条`);
    log('========================================');

  } catch (error) {
    log(`处理过程出错: ${error.message}`, 'error');
    console.error(error);
  } finally {
    await browser.close();
    log('浏览器已关闭');
  }
}

// 运行脚本
main().catch(error => {
  log(`脚本执行失败: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
