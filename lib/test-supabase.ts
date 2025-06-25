import { createClient } from "@/lib/supabase/client";

export async function testSupabaseConnection() {
  try {
    console.log('开始测试Supabase连接...');
    
    const supabase = createClient();
    
    // 测试简单查询
    const { data, error } = await supabase
      .from('demo')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Supabase查询错误:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('Supabase连接测试成功:', data);
    return {
      success: true,
      data
    };
    
  } catch (error) {
    console.error('Supabase连接测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

export async function testSupabaseInsert() {
  try {
    console.log('开始测试Supabase插入...');
    
    const supabase = createClient();
    
    const testData = {
      '日期': '2024-12-26',
      '进厂数据': 999,
      '生产数据': 888,
      '出厂数据': 777,
    };
    
    const { data, error } = await supabase
      .from('demo')
      .insert(testData)
      .select();
    
    if (error) {
      console.error('Supabase插入错误:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('Supabase插入测试成功:', data);
    return {
      success: true,
      data
    };
    
  } catch (error) {
    console.error('Supabase插入测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}
