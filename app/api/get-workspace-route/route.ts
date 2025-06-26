import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== 工作页面路由查询API开始 ===');
  
  try {
    const { workspaceName } = await request.json();
    console.log('查询工作页面:', workspaceName);

    if (!workspaceName) {
      return NextResponse.json({
        success: false,
        error: '工作页面名称不能为空'
      }, { status: 400 });
    }

    // Supabase配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      console.error('Supabase配置缺失');
      return NextResponse.json({
        success: false,
        error: 'Supabase配置缺失'
      }, { status: 500 });
    }

    // 查询工作页面表
    const workPageQueryUrl = `${supabaseUrl}/rest/v1/工作页面?页面名称=eq.${encodeURIComponent(workspaceName)}&select=页面路由`;
    console.log('工作页面查询URL:', workPageQueryUrl);

    const workPageResponse = await fetch(workPageQueryUrl, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!workPageResponse.ok) {
      const errorText = await workPageResponse.text();
      console.error('工作页面查询失败:', errorText);
      return NextResponse.json({
        success: false,
        error: '工作页面查询失败'
      }, { status: 500 });
    }

    const workPages = await workPageResponse.json();
    console.log('工作页面查询结果:', workPages);

    if (workPages && workPages.length > 0) {
      const route = workPages[0].页面路由;
      console.log('找到工作页面路由:', route);
      
      console.log('=== 工作页面路由查询API结束 ===');
      return NextResponse.json({
        success: true,
        route: route,
        workspaceName: workspaceName
      });
    } else {
      console.log('未找到对应的工作页面路由');
      
      console.log('=== 工作页面路由查询API结束 ===');
      return NextResponse.json({
        success: false,
        error: '未找到对应的工作页面路由'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('工作页面路由查询异常:', error);
    
    console.log('=== 工作页面路由查询API结束 ===');
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}
