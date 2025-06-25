export async function diagnoseNetworkConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  console.log('=== 网络诊断开始 ===');
  console.log('目标URL:', supabaseUrl);
  console.log('密钥长度:', anonKey.length);
  
  const results = {
    basicConnection: false,
    corsSupport: false,
    apiEndpoint: false,
    authentication: false,
    errors: [] as string[]
  };

  try {
    // 测试1: 基本连接
    console.log('测试1: 基本连接...');
    const basicResponse = await fetch(supabaseUrl, {
      method: 'GET',
      mode: 'cors'
    });
    results.basicConnection = basicResponse.ok;
    console.log('基本连接结果:', basicResponse.status, basicResponse.statusText);
    
    if (!basicResponse.ok) {
      results.errors.push(`基本连接失败: ${basicResponse.status} ${basicResponse.statusText}`);
    }
  } catch (error) {
    results.errors.push(`基本连接异常: ${error}`);
    console.error('基本连接异常:', error);
  }

  try {
    // 测试2: CORS支持
    console.log('测试2: CORS支持...');
    const corsResponse = await fetch(supabaseUrl + '/rest/v1/', {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'apikey,authorization,content-type'
      }
    });
    results.corsSupport = corsResponse.ok;
    console.log('CORS测试结果:', corsResponse.status, corsResponse.statusText);
    
    if (!corsResponse.ok) {
      results.errors.push(`CORS测试失败: ${corsResponse.status} ${corsResponse.statusText}`);
    }
  } catch (error) {
    results.errors.push(`CORS测试异常: ${error}`);
    console.error('CORS测试异常:', error);
  }

  try {
    // 测试3: API端点
    console.log('测试3: API端点...');
    const apiResponse = await fetch(supabaseUrl + '/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    results.apiEndpoint = apiResponse.ok;
    console.log('API端点结果:', apiResponse.status, apiResponse.statusText);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      results.errors.push(`API端点失败: ${apiResponse.status} ${errorText}`);
      console.log('API端点详细错误:', errorText);
    }
  } catch (error) {
    results.errors.push(`API端点异常: ${error}`);
    console.error('API端点异常:', error);
  }

  try {
    // 测试4: 完整认证
    console.log('测试4: 完整认证...');
    const authResponse = await fetch(supabaseUrl + '/rest/v1/demo?select=count(*)', {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    results.authentication = authResponse.ok;
    console.log('认证测试结果:', authResponse.status, authResponse.statusText);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      results.errors.push(`认证失败: ${authResponse.status} ${errorText}`);
      console.log('认证详细错误:', errorText);
    } else {
      const data = await authResponse.text();
      console.log('认证成功，返回数据:', data);
    }
  } catch (error) {
    results.errors.push(`认证测试异常: ${error}`);
    console.error('认证测试异常:', error);
  }

  console.log('=== 网络诊断结果 ===');
  console.log('基本连接:', results.basicConnection ? '✅' : '❌');
  console.log('CORS支持:', results.corsSupport ? '✅' : '❌');
  console.log('API端点:', results.apiEndpoint ? '✅' : '❌');
  console.log('认证测试:', results.authentication ? '✅' : '❌');
  
  if (results.errors.length > 0) {
    console.log('错误详情:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  return results;
}
