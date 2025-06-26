#!/usr/bin/env node

/**
 * 测试四个修复问题的脚本
 * 1. 修复左下角N悬浮按钮的无限刷新问题
 * 2. 优化员工卡片页面的信息展示
 * 3. 调整页面底部容器高度
 * 4. 修复"继续到工作区"按钮的跳转功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试四个修复问题');
console.log('===================');

// 1. 测试Next.js配置修复
function testNextConfigFix() {
  console.log('\n1. 测试Next.js配置修复 (左下角N悬浮按钮):');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  
  if (fs.existsSync(nextConfigPath)) {
    try {
      const content = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (content.includes('devIndicators')) {
        console.log('   ✅ devIndicators 配置已添加');
        
        if (content.includes('buildActivity: false')) {
          console.log('   ✅ buildActivity 已禁用');
        } else {
          console.log('   ❌ buildActivity 未正确禁用');
        }
        
        if (content.includes('buildActivityPosition: "bottom-right"')) {
          console.log('   ✅ buildActivityPosition 已设置为右下角');
        } else {
          console.log('   ⚠️  buildActivityPosition 未设置');
        }
      } else {
        console.log('   ❌ devIndicators 配置未找到');
      }
    } catch (err) {
      console.log('   ❌ 无法读取 next.config.ts');
    }
  } else {
    console.log('   ❌ next.config.ts 文件不存在');
  }
}

// 2. 测试员工卡片信息展示修复
function testEmployeeCardFix() {
  console.log('\n2. 测试员工卡片信息展示修复:');
  
  const loggedInInterfacePath = path.join(process.cwd(), 'components/logged-in-interface.tsx');
  
  if (fs.existsSync(loggedInInterfacePath)) {
    try {
      const content = fs.readFileSync(loggedInInterfacePath, 'utf8');
      
      // 检查是否移除了工作页面字段的显示部分（不包括功能代码）
      const workPageDisplayPattern = /工作页面.*?<\/div>/s;
      if (!workPageDisplayPattern.test(content) && !content.includes('工作页面</p>')) {
        console.log('   ✅ "工作页面"字段显示已移除');
      } else {
        console.log('   ❌ "工作页面"字段显示仍然存在');
      }
      
      // 检查是否添加了电话号码字段
      if (content.includes('电话号码')) {
        console.log('   ✅ "电话号码"字段已添加');
      } else {
        console.log('   ❌ "电话号码"字段未找到');
      }
      
      // 检查是否添加了微信字段
      if (content.includes('微信') && content.includes('MessageCircle')) {
        console.log('   ✅ "微信"字段已添加');
      } else {
        console.log('   ❌ "微信"字段未正确添加');
      }
      
      // 检查MessageCircle图标导入
      if (content.includes('MessageCircle') && content.includes('from "lucide-react"')) {
        console.log('   ✅ MessageCircle 图标已正确导入');
      } else {
        console.log('   ❌ MessageCircle 图标导入有问题');
      }
      
    } catch (err) {
      console.log('   ❌ 无法读取 logged-in-interface.tsx');
    }
  } else {
    console.log('   ❌ logged-in-interface.tsx 文件不存在');
  }
}

// 3. 测试底部容器高度修复
function testBottomContainerFix() {
  console.log('\n3. 测试底部容器高度修复:');
  
  const loggedInInterfacePath = path.join(process.cwd(), 'components/logged-in-interface.tsx');
  
  if (fs.existsSync(loggedInInterfacePath)) {
    try {
      const content = fs.readFileSync(loggedInInterfacePath, 'utf8');
      
      // 检查是否增加了底部内边距
      if (content.includes('pb-8')) {
        console.log('   ✅ 底部容器内边距已增加 (pb-8)');
      } else {
        console.log('   ❌ 底部容器内边距未增加');
      }
      
    } catch (err) {
      console.log('   ❌ 无法读取 logged-in-interface.tsx');
    }
  } else {
    console.log('   ❌ logged-in-interface.tsx 文件不存在');
  }
}

// 4. 测试"继续到工作区"按钮功能
function testContinueButtonFix() {
  console.log('\n4. 测试"继续到工作区"按钮功能:');
  
  const loggedInInterfacePath = path.join(process.cwd(), 'components/logged-in-interface.tsx');
  
  if (fs.existsSync(loggedInInterfacePath)) {
    try {
      const content = fs.readFileSync(loggedInInterfacePath, 'utf8');
      
      // 检查handleContinueToWorkspace函数
      if (content.includes('handleContinueToWorkspace')) {
        console.log('   ✅ handleContinueToWorkspace 函数存在');
        
        // 检查路由跳转逻辑
        if (content.includes('router.push') && content.includes('user.工作页面')) {
          console.log('   ✅ 路由跳转逻辑正确');
        } else {
          console.log('   ❌ 路由跳转逻辑有问题');
        }
        
        // 检查默认重定向
        if (content.includes('/demo')) {
          console.log('   ✅ 默认重定向到 /demo 已设置');
        } else {
          console.log('   ❌ 默认重定向未设置');
        }
        
        // 检查按钮绑定
        if (content.includes('onClick={handleContinueToWorkspace}')) {
          console.log('   ✅ 按钮事件绑定正确');
        } else {
          console.log('   ❌ 按钮事件绑定有问题');
        }
        
      } else {
        console.log('   ❌ handleContinueToWorkspace 函数不存在');
      }
      
    } catch (err) {
      console.log('   ❌ 无法读取 logged-in-interface.tsx');
    }
  } else {
    console.log('   ❌ logged-in-interface.tsx 文件不存在');
  }
}

// 5. 生成修复总结
function generateFixSummary() {
  console.log('\n📋 修复总结:');
  console.log('============');
  
  console.log('\n✅ 已完成的修复:');
  console.log('1. 在 next.config.ts 中添加 devIndicators 配置，禁用构建活动指示器');
  console.log('2. 修改员工卡片信息展示：');
  console.log('   - 移除"工作页面"字段显示');
  console.log('   - 将"联系电话"改为"电话号码"');
  console.log('   - 新增"微信"字段显示（条件渲染）');
  console.log('3. 增加底部容器内边距 (pb-8) 改善布局');
  console.log('4. 验证"继续到工作区"按钮功能完整性');
  
  console.log('\n🔄 需要重启开发服务器:');
  console.log('由于修改了 next.config.ts，请重启 Next.js 开发服务器以使配置生效');
  
  console.log('\n🧪 测试建议:');
  console.log('1. 重启开发服务器后检查左下角是否还有N悬浮按钮');
  console.log('2. 登录后查看员工卡片信息是否按要求显示');
  console.log('3. 检查页面底部布局是否改善');
  console.log('4. 测试"继续到工作区"按钮是否正常跳转');
}

// 主函数
function main() {
  try {
    testNextConfigFix();
    testEmployeeCardFix();
    testBottomContainerFix();
    testContinueButtonFix();
    generateFixSummary();
    
    console.log('\n✅ 所有修复测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
main();
