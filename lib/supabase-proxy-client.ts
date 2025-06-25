// 使用Next.js API代理的Supabase客户端
// 这个方案绕过浏览器CORS限制，不影响现有Supabase部署
export class SupabaseProxyClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/supabase-proxy';
  }

  // 查询数据
  async select(table: string = 'demo', select: string = '*', limit: number = 10) {
    try {
      console.log('代理客户端查询:', { table, select, limit });
      
      const response = await fetch(`${this.baseUrl}?table=${table}&select=${encodeURIComponent(select)}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`代理查询失败: ${result.error} - ${result.details}`);
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('代理客户端查询错误:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  }

  // 插入数据
  async insert(table: string = 'demo', data: any) {
    try {
      console.log('代理客户端插入:', { table, data });
      
      const response = await fetch(`${this.baseUrl}?table=${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`代理插入失败: ${result.error} - ${result.details}`);
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('代理客户端插入错误:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  }

  // 测试连接
  async testConnection() {
    try {
      console.log('测试代理连接...');
      const result = await this.select('demo', 'count(*)', 1);
      
      if (result.error) {
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('代理连接测试失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  }
}

// 创建代理客户端实例
export function createProxyClient() {
  return new SupabaseProxyClient();
}
