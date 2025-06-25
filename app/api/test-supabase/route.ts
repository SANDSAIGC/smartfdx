import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ 
        error: 'Environment variables missing',
        url: !!supabaseUrl,
        key: !!anonKey 
      }, { status: 500 });
    }

    // 测试GET请求
    const response = await fetch(`${supabaseUrl}/rest/v1/demo?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseText: responseText.substring(0, 500), // 限制长度
      isJSON: responseText.startsWith('{') || responseText.startsWith('[')
    });

  } catch (error) {
    return NextResponse.json({
      error: 'API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({
        error: 'Environment variables missing'
      }, { status: 500 });
    }

    // 接收前端传递的实际数据
    const requestData = await request.json();

    console.log('API路由接收到的数据:', requestData);

    // 验证必填字段
    if (!requestData['日期'] || !requestData['进厂数据'] || !requestData['生产数据'] || !requestData['出厂数据']) {
      return NextResponse.json({
        error: 'Missing required fields',
        received: requestData
      }, { status: 400 });
    }

    // 数据格式验证和转换
    const dataToInsert = {
      '日期': requestData['日期'], // 保持日期格式
      '进厂数据': parseInt(requestData['进厂数据']) || 0,
      '生产数据': parseInt(requestData['生产数据']) || 0,
      '出厂数据': parseInt(requestData['出厂数据']) || 0
    };

    console.log('处理后的数据:', dataToInsert);

    // 提交到Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/demo`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dataToInsert)
    });

    const responseText = await response.text();

    console.log('Supabase响应:', {
      status: response.status,
      statusText: response.statusText,
      responseText: responseText
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseText: responseText.substring(0, 500),
      isJSON: responseText.startsWith('{') || responseText.startsWith('['),
      submittedData: dataToInsert,
      originalData: requestData
    });

  } catch (error) {
    console.error('API POST异常:', error);
    return NextResponse.json({
      error: 'POST test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
