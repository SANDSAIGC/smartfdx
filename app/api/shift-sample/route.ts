import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== 班样记录API开始处理请求 ===');
  
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
    const requiredFields = ['date', 'shift'];
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

    // 4. 数据转换 - 将前端字段映射到数据库字段
    const dataToUpsert = {
      '日期': requestData.date,
      '班次': requestData.shift,
      // 原矿数据
      '原矿水份': requestData.originalMoisture ? parseFloat(requestData.originalMoisture) : null,
      '原矿Pb品位': requestData.originalPbGrade ? parseFloat(requestData.originalPbGrade) : null,
      '原矿Zn品位': requestData.originalZnGrade ? parseFloat(requestData.originalZnGrade) : null,
      // 精矿数据
      '精矿Pb品位': requestData.concentratePbGrade ? parseFloat(requestData.concentratePbGrade) : null,
      '精矿Zn品位': requestData.concentrateZnGrade ? parseFloat(requestData.concentrateZnGrade) : null,
      // 尾矿数据
      '尾矿Pb品位': requestData.tailingsPbGrade ? parseFloat(requestData.tailingsPbGrade) : null,
      '尾矿Zn品位': requestData.tailingsZnGrade ? parseFloat(requestData.tailingsZnGrade) : null,
    };

    console.log('转换后的数据:', dataToUpsert);

    // 5. 检查是否已存在相同日期和班次的记录
    const tableName = '生产日报-FDX';
    const checkUrl = `${supabaseUrl}/rest/v1/${encodeURIComponent(tableName)}?日期=eq.${requestData.date}&班次=eq.${requestData.shift}`;
    
    console.log('检查现有记录URL:', checkUrl);
    
    const checkResponse = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!checkResponse.ok) {
      console.error('检查现有记录失败:', checkResponse.status, checkResponse.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing records',
        status: checkResponse.status,
        statusText: checkResponse.statusText
      }, { status: checkResponse.status });
    }

    const existingRecords = await checkResponse.json();
    console.log('现有记录查询结果:', existingRecords);

    let supabaseResponse;
    let operation;

    if (existingRecords && existingRecords.length > 0) {
      // 6a. 更新现有记录
      operation = 'UPDATE';
      const recordId = existingRecords[0].id;
      console.log('更新现有记录，ID:', recordId);
      
      const updateUrl = `${supabaseUrl}/rest/v1/${encodeURIComponent(tableName)}?id=eq.${recordId}`;
      
      supabaseResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dataToUpsert)
      });
    } else {
      // 6b. 创建新记录
      operation = 'INSERT';
      console.log('创建新记录');
      
      const insertUrl = `${supabaseUrl}/rest/v1/${encodeURIComponent(tableName)}`;
      
      supabaseResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dataToUpsert)
      });
    }

    console.log('Supabase响应状态:', supabaseResponse.status, supabaseResponse.statusText);

    // 7. 处理响应
    const responseText = await supabaseResponse.text();
    console.log('Supabase响应内容:', responseText);

    if (!supabaseResponse.ok) {
      console.error('Supabase请求失败');
      return NextResponse.json({
        success: false,
        error: 'Supabase request failed',
        operation,
        status: supabaseResponse.status,
        statusText: supabaseResponse.statusText,
        responseText: responseText,
        submittedData: dataToUpsert
      }, { status: supabaseResponse.status });
    }

    // 8. 成功响应
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log('操作成功，返回数据:', responseData);

    return NextResponse.json({
      success: true,
      message: `Data ${operation.toLowerCase()}d successfully`,
      operation,
      data: responseData,
      submittedData: dataToUpsert
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
