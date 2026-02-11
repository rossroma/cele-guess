// 测试脚本：对比 Node.js fetch 和 Postman 的请求差异

const testUrl = 'https://www.xgccm.com/star?sex=1&diyu=2&page=1';

const headers = {
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

// 测试 1: 基础请求（可能缺少 Accept 头）
async function test1() {
  console.log('\n=== 测试 1: 基础请求 ===');
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    });
    console.log(`状态码: ${response.status}`);
    console.log(`状态文本: ${response.statusText}`);
    if (response.ok) {
      const text = await response.text();
      console.log(`响应长度: ${text.length} 字符`);
      console.log('✓ 成功');
    } else {
      console.log('✗ 失败');
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
}

// 测试 2: 添加浏览器常见请求头
async function test2() {
  console.log('\n=== 测试 2: 添加浏览器常见请求头 ===');
  try {
    const enhancedHeaders = {
      ...headers,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: enhancedHeaders,
      redirect: 'follow'
    });
    console.log(`状态码: ${response.status}`);
    console.log(`状态文本: ${response.statusText}`);
    if (response.ok) {
      const text = await response.text();
      console.log(`响应长度: ${text.length} 字符`);
      console.log('✓ 成功');
    } else {
      console.log('✗ 失败');
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
}

// 测试 3: 使用 undici 的 fetch（Node.js 18+ 默认使用）
async function test3() {
  console.log('\n=== 测试 3: 检查 undici 版本 ===');
  try {
    const { fetch: undiciFetch } = await import('undici');
    console.log('使用 undici fetch');
    
    const enhancedHeaders = {
      ...headers,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
    
    const response = await undiciFetch(testUrl, {
      method: 'GET',
      headers: enhancedHeaders,
      redirect: 'follow'
    });
    console.log(`状态码: ${response.status}`);
    console.log(`状态文本: ${response.statusText}`);
    if (response.ok) {
      const text = await response.text();
      console.log(`响应长度: ${text.length} 字符`);
      console.log('✓ 成功');
    } else {
      console.log('✗ 失败');
    }
  } catch (error) {
    console.log('undici 不可用，使用原生 fetch');
    console.error('错误:', error.message);
  }
}

// 运行所有测试
async function runTests() {
  console.log('开始诊断请求问题...\n');
  await test1();
  await test2();
  await test3();
  console.log('\n诊断完成！');
}

runTests();
