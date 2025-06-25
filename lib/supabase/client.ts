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
    keyLength: supabaseAnonKey.length
  });

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // 不持久化会话，使用匿名访问
      autoRefreshToken: false,
    },
  });
}
