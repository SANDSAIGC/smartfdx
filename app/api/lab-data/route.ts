import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== 实验室数据查询API开始 ===');
  
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
    const sampleType = searchParams.get('sampleType'); // 样品类型
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit') || '50';

    console.log('查询参数:', { sampleType, startDate, endDate, limit });

    // 3. 根据样品类型确定表名
    const tableMapping: Record<string, string> = {
      'shift_samples': '生产日报-FDX',
      'filter_samples': '压滤样化验记录',
      'incoming_samples': '进厂原矿-FDX',
      'outgoing_sample': '出厂精矿-FDX'
    };

    const tableName = tableMapping[sampleType || ''];
    if (!tableName) {
      return NextResponse.json({
        success: false,
        error: 'Invalid sample type',
        validTypes: Object.keys(tableMapping)
      }, { status: 400 });
    }

    console.log('使用表名:', tableName);

    // 4. 构建查询URL - 使用正确的表名编码
    let queryUrl = `${supabaseUrl}/rest/v1/${encodeURIComponent(tableName)}?select=*&limit=${limit}`;

    // 添加排序 - 根据不同表的字段进行排序
    switch (sampleType) {
      case 'shift_samples':
        // 班样表按日期和班次排序
        queryUrl += `&order=日期.desc,班次.desc`;
        break;
      case 'filter_samples':
        // 压滤样化验记录表按开始时间排序
        queryUrl += `&order=开始时间.desc`;
        break;
      case 'incoming_samples':
      case 'outgoing_sample':
        // 进厂原矿和出厂精矿表按计量日期排序
        queryUrl += `&order=计量日期.desc`;
        break;
      default:
        // 默认按创建时间排序
        queryUrl += `&order=created_at.desc`;
    }

    // 添加日期过滤条件
    if (startDate && endDate) {
      // 根据不同表的日期字段名进行过滤
      let dateField: string;
      switch (sampleType) {
        case 'shift_samples':
          dateField = '日期';
          break;
        case 'filter_samples':
          // 压滤样化验记录表没有日期字段，使用开始时间
          dateField = '开始时间';
          break;
        case 'incoming_samples':
        case 'outgoing_sample':
          dateField = '计量日期';
          break;
        default:
          dateField = '日期';
      }

      // 对于时间戳字段，需要使用不同的过滤格式
      if (dateField === '开始时间') {
        // 时间戳字段使用 ISO 格式
        queryUrl += `&${encodeURIComponent(dateField)}=gte.${startDate}T00:00:00&${encodeURIComponent(dateField)}=lte.${endDate}T23:59:59`;
      } else {
        // 日期字段使用简单格式
        queryUrl += `&${encodeURIComponent(dateField)}=gte.${startDate}&${encodeURIComponent(dateField)}=lte.${endDate}`;
      }
    }

    console.log('查询URL:', queryUrl);

    // 5. 发送请求到Supabase
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

    // 6. 处理响应
    const responseText = await supabaseResponse.text();
    console.log('Supabase响应内容长度:', responseText.length);
    console.log('Supabase响应内容预览:', responseText.substring(0, 200));

    if (!supabaseResponse.ok) {
      console.error('Supabase查询失败:', {
        status: supabaseResponse.status,
        statusText: supabaseResponse.statusText,
        url: queryUrl,
        responseText: responseText.substring(0, 500)
      });

      return NextResponse.json({
        success: false,
        error: 'Supabase query failed',
        status: supabaseResponse.status,
        statusText: supabaseResponse.statusText,
        queryUrl: queryUrl,
        responseText: responseText.substring(0, 500) // 只返回前500字符避免过长
      }, { status: supabaseResponse.status });
    }

    // 7. 解析数据
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse response',
        responseText: responseText.substring(0, 500)
      }, { status: 500 });
    }

    console.log('查询成功，返回数据条数:', Array.isArray(data) ? data.length : 'N/A');

    return NextResponse.json({
      success: true,
      data: data,
      count: Array.isArray(data) ? data.length : 0,
      tableName: tableName,
      queryParams: { sampleType, startDate, endDate, limit }
    });

  } catch (error) {
    console.error('实验室数据查询API异常:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }, { status: 500 });
  }
}
