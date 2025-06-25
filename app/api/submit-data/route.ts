import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== API路由开始处理请求 ===');
  
  try {
    // 1. 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('环境变量检查:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!anonKey,
      url: supabaseUrl,
      keyLength: anonKey?.length
    });

    if (!supabaseUrl || !anonKey) {
      console.error('环境变量缺失');
      return NextResponse.json({ 
        success: false,
        error: 'Environment variables missing',
        hasUrl: !!supabaseUrl,
        hasKey: !!anonKey
      }, { status: 500 });
    }

    // 2. 解析请求数据
    let requestData;
    try {
      requestData = await request.json();
      console.log('接收到的原始数据:', requestData);
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON data',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 });
    }

    // 3. 数据验证
    const requiredFields = ['日期', '进厂数据', '生产数据', '出厂数据'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      console.error('缺少必填字段:', missingFields);
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields,
        receivedData: requestData
      }, { status: 400 });
    }

    // 4. 数据转换
    const dataToInsert = {
      '日期': requestData['日期'],
      '进厂数据': parseInt(requestData['进厂数据']) || 0,
      '生产数据': parseInt(requestData['生产数据']) || 0,
      '出厂数据': parseInt(requestData['出厂数据']) || 0
    };

    console.log('转换后的数据:', dataToInsert);

    // 5. 提交到Supabase
    console.log('开始提交到Supabase...');
    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/demo`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dataToInsert)
    });

    console.log('Supabase响应状态:', supabaseResponse.status, supabaseResponse.statusText);

    // 6. 处理响应
    const responseText = await supabaseResponse.text();
    console.log('Supabase响应内容:', responseText);

    if (!supabaseResponse.ok) {
      console.error('Supabase请求失败');
      return NextResponse.json({
        success: false,
        error: 'Supabase request failed',
        status: supabaseResponse.status,
        statusText: supabaseResponse.statusText,
        responseText: responseText,
        submittedData: dataToInsert
      }, { status: supabaseResponse.status });
    }

    // 7. 成功响应
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log('提交成功，返回数据:', responseData);

    return NextResponse.json({
      success: true,
      message: 'Data submitted successfully',
      data: responseData,
      submittedData: dataToInsert
    });

  } catch (error) {
    console.error('API路由异常:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }, { status: 500 });
  }
}
