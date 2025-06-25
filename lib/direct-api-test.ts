// 直接模拟MCP工具的API调用方式
export async function testDirectAPI() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  console.log('=== 直接API测试开始 ===');
  console.log('URL:', supabaseUrl);
  console.log('Key长度:', anonKey.length);
  console.log('Key前20字符:', anonKey.substring(0, 20));
  
  try {
    // 方法1: 最简单的GET请求（模拟MCP工具）
    console.log('测试1: 简单GET请求...');
    const response1 = await fetch(`${supabaseUrl}/rest/v1/demo?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      }
    });
    
    console.log('简单GET结果:', response1.status, response1.statusText);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('GET成功，数据:', data1);
      return { success: true, method: 'GET', data: data1 };
    } else {
      const error1 = await response1.text();
      console.log('GET失败，错误:', error1);
    }
    
    // 方法2: 带完整头部的请求
    console.log('测试2: 完整头部请求...');
    const response2 = await fetch(`${supabaseUrl}/rest/v1/demo?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'supabase-js/2.0.0'
      }
    });
    
    console.log('完整头部结果:', response2.status, response2.statusText);
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('完整头部成功，数据:', data2);
      return { success: true, method: 'FULL_HEADERS', data: data2 };
    } else {
      const error2 = await response2.text();
      console.log('完整头部失败，错误:', error2);
    }
    
    // 方法3: POST插入测试
    console.log('测试3: POST插入测试...');
    const testData = {
      '日期': '2024-12-26',
      '进厂数据': 999,
      '生产数据': 888,
      '出厂数据': 777
    };
    
    const response3 = await fetch(`${supabaseUrl}/rest/v1/demo`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('POST插入结果:', response3.status, response3.statusText);
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('POST成功，数据:', data3);
      return { success: true, method: 'POST', data: data3 };
    } else {
      const error3 = await response3.text();
      console.log('POST失败，错误:', error3);
    }
    
    return { success: false, error: '所有方法都失败' };
    
  } catch (error) {
    console.error('直接API测试异常:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}

// 测试不同的URL格式
export async function testDifferentURLs() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const urls = [
    'http://132.232.143.210:28000',
    'https://132.232.143.210:28443',
    'http://132.232.143.210:28000/',
    'https://132.232.143.210:28443/'
  ];
  
  console.log('=== 测试不同URL格式 ===');
  
  for (const baseUrl of urls) {
    try {
      console.log(`测试URL: ${baseUrl}`);
      const response = await fetch(`${baseUrl}/rest/v1/demo?select=count(*)&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        }
      });
      
      console.log(`${baseUrl} 结果:`, response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log(`${baseUrl} 成功:`, data);
        return { success: true, workingUrl: baseUrl, data };
      }
    } catch (error) {
      console.log(`${baseUrl} 异常:`, error);
    }
  }
  
  return { success: false, error: '所有URL都失败' };
}
