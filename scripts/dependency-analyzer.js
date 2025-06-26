#!/usr/bin/env node

/**
 * 依赖项分析脚本
 * 分析项目中实际使用的依赖项，识别未使用的包
 */

const fs = require('fs');
const path = require('path');

console.log('📦 依赖项分析工具');
console.log('================================');

// 读取 package.json
function getPackageInfo() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return {
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {}
    };
  } catch (err) {
    console.error('❌ 无法读取 package.json');
    return null;
  }
}

// 扫描项目文件中的导入语句
function scanImports(dir, imports = new Set()) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      // 跳过不需要扫描的目录
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        return;
      }
      
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanImports(filePath, imports);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // 匹配 import 语句
          const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
          if (importMatches) {
            importMatches.forEach(match => {
              const packageMatch = match.match(/from\s+['"]([^'"]+)['"]/);
              if (packageMatch) {
                const packageName = packageMatch[1];
                // 只记录 npm 包，不记录相对路径
                if (!packageName.startsWith('.') && !packageName.startsWith('/')) {
                  // 提取包名（去掉子路径）
                  const basePackage = packageName.startsWith('@') 
                    ? packageName.split('/').slice(0, 2).join('/')
                    : packageName.split('/')[0];
                  imports.add(basePackage);
                }
              }
            });
          }
          
          // 匹配 require 语句
          const requireMatches = content.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
          if (requireMatches) {
            requireMatches.forEach(match => {
              const packageMatch = match.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
              if (packageMatch) {
                const packageName = packageMatch[1];
                if (!packageName.startsWith('.') && !packageName.startsWith('/')) {
                  const basePackage = packageName.startsWith('@') 
                    ? packageName.split('/').slice(0, 2).join('/')
                    : packageName.split('/')[0];
                  imports.add(basePackage);
                }
              }
            });
          }
        } catch (err) {
          // 忽略读取错误
        }
      }
    });
  } catch (err) {
    // 忽略目录读取错误
  }
  
  return imports;
}

// 分析依赖项使用情况
function analyzeDependencies() {
  const packageInfo = getPackageInfo();
  if (!packageInfo) return;
  
  console.log('\n🔍 扫描项目文件中的导入语句...');
  const usedImports = scanImports(process.cwd());
  
  console.log(`   发现 ${usedImports.size} 个被导入的包`);
  
  const allDeps = { ...packageInfo.dependencies, ...packageInfo.devDependencies };
  const allDepNames = Object.keys(allDeps);
  
  console.log('\n📊 依赖项使用分析:');
  
  // 已使用的依赖项
  const usedDeps = [];
  const unusedDeps = [];
  
  allDepNames.forEach(dep => {
    if (usedImports.has(dep)) {
      usedDeps.push(dep);
    } else {
      // 检查是否是间接使用（如 Next.js 内置依赖）
      const isIndirectlyUsed = checkIndirectUsage(dep, usedImports);
      if (isIndirectlyUsed) {
        usedDeps.push(dep);
      } else {
        unusedDeps.push(dep);
      }
    }
  });
  
  console.log(`\n✅ 已使用的依赖项 (${usedDeps.length}个):`);
  usedDeps.forEach(dep => {
    const version = allDeps[dep];
    const type = packageInfo.dependencies[dep] ? '生产' : '开发';
    console.log(`   ${dep}@${version} (${type})`);
  });
  
  if (unusedDeps.length > 0) {
    console.log(`\n⚠️  可能未使用的依赖项 (${unusedDeps.length}个):`);
    unusedDeps.forEach(dep => {
      const version = allDeps[dep];
      const type = packageInfo.dependencies[dep] ? '生产' : '开发';
      console.log(`   ${dep}@${version} (${type})`);
    });
  }
  
  // 分析大型依赖项
  const largeDeps = identifyLargeDependencies(usedDeps, allDeps);
  if (largeDeps.length > 0) {
    console.log(`\n📦 大型依赖项 (${largeDeps.length}个):`);
    largeDeps.forEach(dep => {
      console.log(`   ${dep.name}@${dep.version} - ${dep.reason}`);
    });
  }
  
  return { usedDeps, unusedDeps, largeDeps };
}

// 检查间接使用
function checkIndirectUsage(dep, usedImports) {
  // Next.js 相关的必需依赖
  const nextjsEssential = [
    'next',
    'react',
    'react-dom',
    'typescript',
    '@types/node',
    '@types/react',
    '@types/react-dom'
  ];
  
  // Tailwind CSS 相关
  const tailwindEssential = [
    'tailwindcss',
    'autoprefixer',
    'postcss'
  ];
  
  // ESLint 相关
  const eslintEssential = [
    'eslint',
    'eslint-config-next',
    '@eslint/eslintrc'
  ];
  
  // shadcn/ui 相关
  const shadcnEssential = [
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
    'tailwindcss-animate'
  ];
  
  const essentialDeps = [
    ...nextjsEssential,
    ...tailwindEssential,
    ...eslintEssential,
    ...shadcnEssential
  ];
  
  return essentialDeps.includes(dep);
}

// 识别大型依赖项
function identifyLargeDependencies(usedDeps, allDeps) {
  const largeDeps = [];
  
  const knownLargeDeps = {
    '@supabase/supabase-js': 'Supabase 客户端库',
    'next': 'Next.js 框架',
    'react': 'React 库',
    'typescript': 'TypeScript 编译器',
    'eslint': 'ESLint 代码检查工具',
    'tailwindcss': 'Tailwind CSS 框架',
    'date-fns': '日期处理库',
    'lucide-react': '图标库'
  };
  
  usedDeps.forEach(dep => {
    if (knownLargeDeps[dep]) {
      largeDeps.push({
        name: dep,
        version: allDeps[dep],
        reason: knownLargeDeps[dep]
      });
    }
  });
  
  return largeDeps;
}

// 生成优化建议
function generateOptimizationSuggestions(analysis) {
  console.log('\n💡 优化建议:');
  
  if (analysis.unusedDeps.length > 0) {
    console.log('\n1. 移除未使用的依赖项:');
    analysis.unusedDeps.forEach(dep => {
      console.log(`   npm uninstall ${dep}`);
    });
  }
  
  if (analysis.largeDeps.length > 0) {
    console.log('\n2. 大型依赖项优化:');
    analysis.largeDeps.forEach(dep => {
      switch (dep.name) {
        case 'date-fns':
          console.log(`   ${dep.name}: 考虑使用 tree-shaking 或按需导入`);
          break;
        case 'lucide-react':
          console.log(`   ${dep.name}: 已在 next.config.ts 中配置包导入优化`);
          break;
        case '@supabase/supabase-js':
          console.log(`   ${dep.name}: 考虑使用动态导入延迟加载`);
          break;
        default:
          console.log(`   ${dep.name}: 检查是否可以按需导入`);
      }
    });
  }
  
  console.log('\n3. 通用优化:');
  console.log('   - 使用 dynamic imports 延迟加载大型组件');
  console.log('   - 配置 webpack bundle analyzer 分析包大小');
  console.log('   - 考虑使用 CDN 加载大型库');
}

// 主函数
function main() {
  const analysis = analyzeDependencies();
  if (analysis) {
    generateOptimizationSuggestions(analysis);
  }
}

// 运行分析
main();
