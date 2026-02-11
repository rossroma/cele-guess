import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const BASE_URL = 'https://www.xgccm.com/star?sex=0&diyu=2';
const OUTPUT_FILE = path.join(__dirname, '../data/celebrities.json');
const PAGE_SIZE = 30; // 每页返回30条数据

// 统一的请求头配置（模拟真实浏览器）
const DEFAULT_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
  'Cookie': 'server_name_session=26df3593ce6e0bce9f243a6e0fa6db18; 6361e2d6b7cf14ea6305901a3a018f56=8c9daef385a1705c1a6db9c35505d1c2; XSRF-TOKEN=eyJpdiI6IjNMeEZrczlWS3BnTS9aTDhWOEp6TUE9PSIsInZhbHVlIjoidnpRUDYya1pIK3JiYkNiLzN6eEkwWnQ3bWZLY1dHb2JwRnAwdDZYbjNGaWZjRUdRKzBBWFF6SVV5NkJ6SzdsTUl2UHJpZ2Z0Wm5HZGozUEtPVHZvM3d3TklEalVLQ1RWM3N2WDRLRGJhVGdvKzVHQlN5Z3pzZzg4YVFua2swdkYiLCJtYWMiOiI4YTZmZjY3ODRhMzNjYWFmOThiM2YxNjQ4YTk0NjAxMjE1NzdmZTg4ZGE1ZGRkOGE1NmQyYmI3ODVkNzdkNmVkIiwidGFnIjoiIn0%3D; swcm_session=eyJpdiI6IkRJZDdjVTRIUWdpQTkxa3dVMHkxNlE9PSIsInZhbHVlIjoiNlRBazErbHlWV1NNYmFEZEhGT1U4L040dTdFcytkRlhtRUtWQVlZWmFrTjIwRk93b2VYck1zZlMzS3Y1SmlaR2FIT1JzK1kwaVVEa0RsU2JBcFMvNmVodzI3QTRXR3ZReDdmdzQyWmx6UUpPOTVBc093U1BOd0h6TEFPQTU4Z2giLCJtYWMiOiJkZWRmMGUxYjU0NzhjMzQxZGNlYTE1MjFjMmNhNDdlYzE0ZDZmMzc2NjFkNDBjMzI2NDlmYmM3OWRiNGYxN2Y2IiwidGFnIjoiIn0%3D; 359a16815e5f40a69f638f8c0167a4db=268bdb7e1c35f933766d1451ef614b09; XSRF-TOKEN=eyJpdiI6IldHbDVDKzVYT0I5b212amFGWGtrdVE9PSIsInZhbHVlIjoicHUvRjdmZ0NsSzNnNE1jSFkwUFkrZkc2azAzclg0QllDUXl5a0R0TnBScmUzSU1XZ3orU1U5T0xtUCttNkRPVExkZ3lJVDZMRC9sQnNZdWVQMHk1aXNuWGZWUy9OamVYZ1Brb3hrUmQxWUhDZytWdzhBZis1Y0sxZ2pManQ2VDMiLCJtYWMiOiIyOWIwYTBhYTM4YWEzNzQ3M2ExMTJmYWYxMGNiNGNhMThiYzVkOGZkOTAwYTkwZTAzYmFjNTczNzY1NmU1MjZiIiwidGFnIjoiIn0%3D; swcm_session=eyJpdiI6InloRmJNZE5PWkpCMXhBNnVRSE5ZdkE9PSIsInZhbHVlIjoiUUhlYm1zK3Z6UU1KNzlXS0c2Q0RTR1Rwc29ZT1JJbSttQitJdzB6dm5hQWtCbElvQUx1WmNFZUw0Qko1WmJjaUpsV3RYdzlPUUk0UFhUY0RuUUt2ektkTFRjS0pwdWRJMGI1TGRMVEF2K3g3MlJ1eWxXTndyd0FzWWpGaVI1OTQiLCJtYWMiOiJlOTE2MDQ3YWJjNjQ1OTQ0YjJkNDI0YjZlN2ZlNGM5MmFiM2I4OWY1Mjg3MjExZDgzODQ5NGU2OTdmNDgyOWM5IiwidGFnIjoiIn0%3D',
  'Referer': 'https://www.xgccm.com/star',
  'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-user': '?1'
};

/**
 * 使用 curl 发送请求（绕过 TLS 指纹识别）
 * @param {string} url - 请求URL
 * @returns {Promise<string>} HTML内容
 */
function fetchWithCurl(url) {
  return new Promise((resolve, reject) => {
    // 构建 curl 参数数组
    const args = [
      '-s', '-L',
      url,
      '-H', `User-Agent: ${DEFAULT_HEADERS['User-Agent']}`,
      '-H', `Cookie: ${DEFAULT_HEADERS['Cookie']}`,
      '-H', `Referer: ${DEFAULT_HEADERS['Referer']}`,
      '-H', `Accept: ${DEFAULT_HEADERS['Accept']}`,
      '-H', `Accept-Language: ${DEFAULT_HEADERS['Accept-Language']}`,
      '-H', `Accept-Encoding: ${DEFAULT_HEADERS['Accept-Encoding']}`,
      '-H', `sec-ch-ua: ${DEFAULT_HEADERS['sec-ch-ua']}`,
      '-H', `sec-ch-ua-mobile: ${DEFAULT_HEADERS['sec-ch-ua-mobile']}`,
      '-H', `sec-ch-ua-platform: ${DEFAULT_HEADERS['sec-ch-ua-platform']}`,
      '-H', `sec-fetch-dest: ${DEFAULT_HEADERS['sec-fetch-dest']}`,
      '-H', `sec-fetch-mode: ${DEFAULT_HEADERS['sec-fetch-mode']}`,
      '-H', `sec-fetch-site: ${DEFAULT_HEADERS['sec-fetch-site']}`,
      '-H', `sec-fetch-user: ${DEFAULT_HEADERS['sec-fetch-user']}`,
      '--compressed'
    ];
    
    const curlProcess = spawn('curl', args);
    let stdout = '';
    let stderr = '';
    
    curlProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    curlProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    curlProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Curl 请求失败 (退出码: ${code}): ${stderr || '未知错误'}`));
      } else if (stderr && !stderr.includes('Warning')) {
        reject(new Error(`Curl 请求失败: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });
    
    curlProcess.on('error', (error) => {
      reject(new Error(`Curl 进程启动失败: ${error.message}`));
    });
  });
}

/**
 * 从详情页获取高清大图
 * @param {string} detailUrl - 详情页URL
 * @returns {Promise<string|null>} 高清图片URL
 */
async function getDetailPhoto(detailUrl) {
  try {
    if (!detailUrl) return null;

    const html = await fetchWithCurl(detailUrl);
    const $ = cheerio.load(html);
    
    // 从详情页获取高清大图
    const $img = $('.star-detail-l-pic img');
    const imgSrc = $img.attr('src') || $img.attr('data-original');
    
    if (!imgSrc) {
      return null;
    }

    // 构建完整的图片URL
    const fullImgUrl = imgSrc.trim().startsWith('/')
      ? `https://www.xgccm.com${imgSrc.trim()}`
      : imgSrc.trim();

    return fullImgUrl;
  } catch (error) {
    console.warn(`获取详情页图片失败: ${detailUrl}`, error.message);
    return null;
  }
}

/**
 * 解析HTML页面，提取明星数据
 * @param {number} page - 页码
 */
async function parseCelebrityData(page = 1) {
  try {
    // 构建带page参数的URL
    const url = `${BASE_URL}&page=${page}`;
    
    // 从URL中提取sex和diyu参数
    const urlObj = new URL(url);
    const sex = urlObj.searchParams.get('sex');
    const diyu = urlObj.searchParams.get('diyu');
    
    console.log(`正在获取第 ${page} 页数据...`);

    // 获取HTML页面（使用 curl 绕过 TLS 指纹识别）
    const html = await fetchWithCurl(url);
      console.log('HTML数据获取成功');

    // 使用cheerio解析HTML
    const $ = cheerio.load(html);
    const celebrities = [];

    // 解析每个li元素，提取明星数据
    $('.star-zl-list ul li').each((index, element) => {
      const $li = $(element);
      const dataId = $li.attr('data-id');
      const $link = $li.find('a.mxbox');
      const href = $link.attr('href');

      // 解析图片
      const $img = $li.find('.picbox img');
      const imgSrc = $img.attr('src') || $img.attr('data-original');

      // 解析明星名字
      const name = $li.find('.starname').text().trim();

      // 构建完整的图片URL
      const fullImgUrl = imgSrc && imgSrc.startsWith('/')
        ? `https://www.xgccm.com${imgSrc}`
        : imgSrc;

      if (dataId && name) {
        celebrities.push({
          id: dataId,
          name: name,
          photo: fullImgUrl,
          gender: sex,
          region: diyu
        });
      }
    });

    console.log(`成功解析第 ${page} 页，共 ${celebrities.length} 位明星数据`);

    return celebrities;
  } catch (error) {
    console.error(`解析第 ${page} 页数据时出错:`, error);
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

    // 循环翻页，直到返回数据小于30条
    while (hasMoreData) {
      const celebrities = await parseCelebrityData(page);
      
      if (celebrities.length === 0) {
        // 如果返回0条数据，停止翻页
        console.log(`第 ${page} 页返回0条数据，停止翻页`);
        hasMoreData = false;
      } else {
        allCelebrities = allCelebrities.concat(celebrities);
        
        // 如果返回数据小于30条，说明已经是最后一页
        if (celebrities.length < PAGE_SIZE) {
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
  } catch (error) {
    console.error('\n✗ 数据生成失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
