import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 测试用户数据
    const testUsers = [
      { email: 'test@fdx.com', password: 'test123456' },
      { email: 'demo@fdx.com', password: 'demo123456' },
      { email: 'admin@fdx.com', password: 'admin123456' }
    ];

    const results = [];

    for (const user of testUsers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true
        });

        if (error) {
          console.error(`创建用户 ${user.email} 失败:`, error);
          results.push({
            email: user.email,
            success: false,
            error: error.message
          });
        } else {
          console.log(`用户 ${user.email} 创建成功`);
          results.push({
            email: user.email,
            success: true,
            userId: data.user?.id
          });
        }
      } catch (err) {
        console.error(`创建用户 ${user.email} 异常:`, err);
        results.push({
          email: user.email,
          success: false,
          error: err instanceof Error ? err.message : '未知错误'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '测试用户创建完成',
      results
    });

  } catch (error) {
    console.error('创建测试用户API错误:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
