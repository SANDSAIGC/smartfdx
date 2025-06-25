import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase环境变量缺失:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey
    });
    throw new Error('Supabase配置错误：缺少必要的环境变量');
  }

  console.log('Supabase配置:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey.length,
    keyPreview: supabaseAnonKey.substring(0, 50) + '...'
  });

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }
  });
}

// 备用：使用service role key的客户端（仅用于测试）
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // 注意：通常不建议在前端使用service role key，这里仅用于测试
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NTA2OTQ0NDAwLCJleHAiOjE5MDg0NjA4MDB9.b5G8hlawEhdHuE8n_CnAm5waQwsscWWzN8JFrk15oGM';

  if (!supabaseUrl) {
    throw new Error('Supabase URL缺失');
  }

  console.log('使用Service Role Key创建客户端（仅测试用）');

  return createBrowserClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}
