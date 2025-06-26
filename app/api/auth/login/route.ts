import { NextRequest, NextResponse } from 'next/server';
import { LoginRequest, LoginResponse } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== 登录API开始 ===');

    const body: LoginRequest = await request.json();
    const { email, password } = body;

    console.log('登录请求:', { email, password: '***' });

    // 验证输入
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '请提供账号和密码'
      } as LoginResponse, { status: 400 });
    }

    // 获取环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      console.error('Supabase配置缺失');
      return NextResponse.json({
        success: false,
        message: 'Supabase配置缺失'
      } as LoginResponse, { status: 500 });
    }

    // 1. 直接查询用户资料表
    const userQueryUrl = `${supabaseUrl}/rest/v1/用户资料?账号=eq.${encodeURIComponent(email)}&状态=eq.正常&select=*`;
    console.log('用户查询URL:', userQueryUrl);

    const userResponse = await fetch(userQueryUrl, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('用户查询失败:', errorText);
      return NextResponse.json({
        success: false,
        message: '数据库查询失败'
      } as LoginResponse, { status: 500 });
    }

    const users = await userResponse.json();
    console.log('用户查询结果:', users);

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: false,
        message: '用户不存在或账号已被禁用'
      } as LoginResponse, { status: 404 });
    }

    const userProfile = users[0];

    // 2. 验证密码
    if (userProfile.密码 !== password) {
      console.log('密码验证失败');
      return NextResponse.json({
        success: false,
        message: '账号或密码错误'
      } as LoginResponse, { status: 401 });
    }

    console.log('密码验证成功');

    // 3. 获取用户的工作页面路由
    let redirectUrl = '/demo'; // 默认页面

    if (userProfile.工作页面) {
      const workPageQueryUrl = `${supabaseUrl}/rest/v1/工作页面?页面名称=eq.${encodeURIComponent(userProfile.工作页面)}&select=页面路由`;
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

      if (workPageResponse.ok) {
        const workPages = await workPageResponse.json();
        console.log('工作页面查询结果:', workPages);

        if (workPages && workPages.length > 0) {
          redirectUrl = workPages[0].页面路由;
        }
      } else {
        console.error('工作页面查询失败:', await workPageResponse.text());
      }
    }

    console.log('最终重定向URL:', redirectUrl);

    // 4. 返回成功响应
    const response: LoginResponse = {
      success: true,
      message: '登录成功',
      redirectUrl: redirectUrl,
      user: {
        id: userProfile.id,
        账号: userProfile.账号,
        姓名: userProfile.姓名,
        部门: userProfile.部门,
        工作页面: userProfile.工作页面,
        职称: userProfile.职称
      }
    };

    console.log('返回响应:', response);
    console.log('=== 登录API结束 ===');

    return NextResponse.json(response);

  } catch (error) {
    console.error('登录API错误:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误，请稍后重试',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as LoginResponse, { status: 500 });
  }
}
