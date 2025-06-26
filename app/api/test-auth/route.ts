import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== 测试登录API开始 ===');
    
    // 1. 解析请求体
    const body = await request.json();
    console.log('请求体:', body);
    
    const { email, password } = body;
    
    // 2. 验证输入
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '请提供账号和密码'
      }, { status: 400 });
    }
    
    // 3. 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Anon Key存在:', !!anonKey);
    
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({
        success: false,
        message: 'Supabase配置缺失'
      }, { status: 500 });
    }
    
    // 4. 直接查询用户资料表
    const queryUrl = `${supabaseUrl}/rest/v1/用户资料?账号=eq.${email}&状态=eq.正常&select=*`;
    console.log('查询URL:', queryUrl);
    
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('查询响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('查询失败:', errorText);
      return NextResponse.json({
        success: false,
        message: '数据库查询失败'
      }, { status: 500 });
    }
    
    const users = await response.json();
    console.log('查询结果:', users);
    
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: false,
        message: '用户不存在或账号已被禁用'
      }, { status: 404 });
    }
    
    const user = users[0];
    
    // 5. 验证密码
    if (user.密码 !== password) {
      return NextResponse.json({
        success: false,
        message: '账号或密码错误'
      }, { status: 401 });
    }
    
    // 6. 查询工作页面路由
    let redirectUrl = '/demo'; // 默认页面
    
    if (user.工作页面) {
      const workPageUrl = `${supabaseUrl}/rest/v1/工作页面?页面名称=eq.${user.工作页面}&select=页面路由`;
      console.log('工作页面查询URL:', workPageUrl);
      
      const workPageResponse = await fetch(workPageUrl, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (workPageResponse.ok) {
        const workPages = await workPageResponse.json();
        console.log('工作页面查询结果:', workPages);
        
        if (workPages && workPages.length > 0) {
          redirectUrl = workPages[0].页面路由;
        }
      }
    }
    
    console.log('最终重定向URL:', redirectUrl);
    
    // 7. 返回成功响应
    const result = {
      success: true,
      message: '登录成功',
      redirectUrl: redirectUrl,
      user: {
        id: user.id,
        账号: user.账号,
        姓名: user.姓名,
        部门: user.部门,
        工作页面: user.工作页面
      }
    };
    
    console.log('返回结果:', result);
    console.log('=== 测试登录API结束 ===');
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('测试登录API错误:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
