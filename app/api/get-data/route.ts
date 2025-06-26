import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== 数据读取API开始 ===');
  
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

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limit = searchParams.get('limit') || '50';

    console.log('查询参数:', { date, limit });

    // 3. 构建查询URL
    let queryUrl = `${supabaseUrl}/rest/v1/demo?select=*&order=created_at.desc&limit=${limit}`;
    
    if (date) {
      queryUrl += `&日期=eq.${date}`;
    }

    console.log('查询URL:', queryUrl);

    // 4. 发送请求到Supabase
    const supabaseResponse = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Supabase响应状态:', supabaseResponse.status, supabaseResponse.statusText);

    // 5. 处理响应
    const responseText = await supabaseResponse.text();
    console.log('Supabase响应内容:', responseText);

    if (!supabaseResponse.ok) {
      console.error('Supabase查询失败');
      return NextResponse.json({
        success: false,
        error: 'Supabase query failed',
        status: supabaseResponse.status,
        statusText: supabaseResponse.statusText,
        responseText: responseText
      }, { status: supabaseResponse.status });
    }

    // 6. 解析数据
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse response',
        responseText: responseText
      }, { status: 500 });
    }

    console.log('查询成功，返回数据条数:', Array.isArray(data) ? data.length : 'N/A');

    return NextResponse.json({
      success: true,
      data: data,
      count: Array.isArray(data) ? data.length : 0,
      queryParams: { date, limit }
    });

  } catch (error) {
    console.error('数据读取API异常:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('=== 数据读取API开始 (POST) ===');

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

    // 2. 获取POST请求体
    const body = await request.json();
    const { tableName, dateRange } = body;

    console.log('POST请求参数:', { tableName, dateRange });

    if (!tableName) {
      return NextResponse.json({
        success: false,
        error: 'tableName is required'
      }, { status: 400 });
    }

    // 3. 构建查询URL - 根据表名确定正确的日期字段
    let dateField = '日期'; // 默认日期字段

    // 根据表名确定正确的日期字段
    if (tableName === '进厂原矿-FDX' || tableName === '出厂精矿-FDX') {
      dateField = '计量日期';
    } else if (tableName === '压滤样化验记录') {
      dateField = '开始时间';
    } else if (tableName === '生产日报-FDX') {
      dateField = '日期';
    }

    let queryUrl = `${supabaseUrl}/rest/v1/${encodeURIComponent(tableName)}?select=*&order=${encodeURIComponent(dateField)}.desc`;

    // 添加日期范围过滤
    if (dateRange?.start && dateRange?.end) {
      queryUrl += `&${encodeURIComponent(dateField)}=gte.${dateRange.start}&${encodeURIComponent(dateField)}=lte.${dateRange.end}`;
    }

    console.log('查询URL:', queryUrl);

    // 4. 发送请求到Supabase
    const supabaseResponse = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Supabase响应状态:', supabaseResponse.status, supabaseResponse.statusText);

    // 5. 处理响应
    const responseText = await supabaseResponse.text();
    console.log('Supabase响应内容:', responseText);

    if (!supabaseResponse.ok) {
      console.error('Supabase查询失败');
      return NextResponse.json({
        success: false,
        error: 'Supabase query failed',
        status: supabaseResponse.status,
        statusText: supabaseResponse.statusText,
        responseText: responseText
      }, { status: supabaseResponse.status });
    }

    // 6. 解析数据
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse response',
        responseText: responseText
      }, { status: 500 });
    }

    console.log('查询成功，返回数据条数:', Array.isArray(data) ? data.length : 'N/A');

    return NextResponse.json({
      success: true,
      data: data,
      count: Array.isArray(data) ? data.length : 0,
      queryParams: { tableName, dateRange }
    });

  } catch (error) {
    console.error('数据读取API异常 (POST):', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }, { status: 500 });
  }
}
