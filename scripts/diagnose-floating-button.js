#!/usr/bin/env node

/**
 * 诊断左下角N悬浮按钮无限刷新问题
 * 检查可能的原因和解决方案
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 诊断左下角N悬浮按钮无限刷新问题');
console.log('=====================================');

// 1. 检查是否有可能的悬浮按钮组件
function checkFloatingComponents() {
  console.log('\n1. 检查可能的悬浮按钮组件:');
  
  const searchPatterns = [
    'fixed',
    'absolute', 
    'z-50',
    'z-40',
    'z-30',
    'bottom-',
    'left-',
    'floating',
    'notification',
    'toast',
    'alert'
  ];
  
  const componentsDir = path.join(process.cwd(), 'components');
  const appDir = path.join(process.cwd(), 'app');
  
  function searchInDirectory(dir, dirName) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { recursive: true });
    let foundIssues = false;
    
    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const filePath = path.join(dir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          searchPatterns.forEach(pattern => {
            if (content.includes(pattern)) {
              if (!foundIssues) {
                console.log(`\n   在 ${dirName} 目录中发现可能相关的代码:`);
                foundIssues = true;
              }
              console.log(`   📁 ${file}: 包含 "${pattern}"`);
            }
          });
        } catch (err) {
          // 忽略读取错误
        }
      }
    });
    
    if (!foundIssues) {
      console.log(`   ✅ ${dirName} 目录中未发现明显的悬浮按钮代码`);
    }
  }
  
  searchInDirectory(componentsDir, 'components');
  searchInDirectory(appDir, 'app');
}

// 2. 检查Next.js配置
function checkNextConfig() {
  console.log('\n2. 检查Next.js配置:');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    try {
      const content = fs.readFileSync(nextConfigPath, 'utf8');
      
      // 检查可能导致问题的配置
      const problematicConfigs = [
        'experimental',
        'turbopack',
        'webpack',
        'devIndicators'
      ];
      
      problematicConfigs.forEach(config => {
        if (content.includes(config)) {
          console.log(`   ⚠️  发现配置: ${config}`);
        }
      });
      
      // 检查是否禁用了开发指示器
      if (content.includes('devIndicators')) {
        console.log('   📋 建议检查 devIndicators 配置');
      } else {
        console.log('   💡 建议添加 devIndicators: { buildActivity: false } 来禁用构建指示器');
      }
      
    } catch (err) {
      console.log('   ❌ 无法读取 next.config.ts');
    }
  } else {
    console.log('   ✅ 未找到 next.config.ts，使用默认配置');
  }
}

// 3. 检查环境变量
function checkEnvironmentVars() {
  console.log('\n3. 检查环境变量:');
  
  const envFiles = ['.env.local', '.env', '.env.development'];
  let foundEnvIssues = false;
  
  envFiles.forEach(envFile => {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        
        // 检查可能导致问题的环境变量
        const problematicVars = [
          'NEXT_TELEMETRY_DISABLED',
          'TURBOPACK',
          'FAST_REFRESH',
          'NODE_ENV'
        ];
        
        problematicVars.forEach(varName => {
          if (content.includes(varName)) {
            console.log(`   📋 ${envFile}: 包含 ${varName}`);
            foundEnvIssues = true;
          }
        });
      } catch (err) {
        console.log(`   ❌ 无法读取 ${envFile}`);
      }
    }
  });
  
  if (!foundEnvIssues) {
    console.log('   ✅ 环境变量配置正常');
  }
}

// 4. 检查可能的第三方库
function checkThirdPartyLibraries() {
  console.log('\n4. 检查第三方库:');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // 可能包含调试工具的库
    const suspiciousLibs = [
      'react-hot-toast',
      'react-toastify', 
      'sonner',
      'react-notifications',
      'notistack',
      '@radix-ui/react-toast',
      'react-query',
      '@tanstack/react-query',
      'swr'
    ];
    
    let foundSuspicious = false;
    suspiciousLibs.forEach(lib => {
      if (allDeps[lib]) {
        console.log(`   ⚠️  发现可能相关的库: ${lib}@${allDeps[lib]}`);
        foundSuspicious = true;
      }
    });
    
    if (!foundSuspicious) {
      console.log('   ✅ 未发现明显可疑的第三方库');
    }
    
  } catch (err) {
    console.log('   ❌ 无法读取 package.json');
  }
}

// 5. 生成解决方案建议
function generateSolutions() {
  console.log('\n5. 解决方案建议:');
  console.log('================');
  
  console.log('\n🔧 立即尝试的解决方案:');
  console.log('1. 清除浏览器缓存和开发者工具状态');
  console.log('2. 禁用所有浏览器扩展，特别是React DevTools');
  console.log('3. 尝试在无痕模式下访问应用');
  console.log('4. 重启Next.js开发服务器');
  
  console.log('\n⚙️  配置修复方案:');
  console.log('1. 在 next.config.ts 中添加:');
  console.log('   devIndicators: {');
  console.log('     buildActivity: false,');
  console.log('     buildActivityPosition: "bottom-right"');
  console.log('   }');
  
  console.log('\n2. 在环境变量中添加:');
  console.log('   NEXT_TELEMETRY_DISABLED=1');
  
  console.log('\n🔍 进一步诊断:');
  console.log('1. 在浏览器开发者工具中检查DOM结构');
  console.log('2. 查看Console是否有相关错误信息');
  console.log('3. 检查Network面板是否有异常请求');
  console.log('4. 使用Elements面板定位具体的悬浮按钮元素');
}

// 主函数
function main() {
  try {
    checkFloatingComponents();
    checkNextConfig();
    checkEnvironmentVars();
    checkThirdPartyLibraries();
    generateSolutions();
    
    console.log('\n✅ 诊断完成！');
    console.log('💡 如果问题仍然存在，请在浏览器开发者工具中检查具体的DOM元素');
    
  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error.message);
  }
}

// 运行诊断
main();
