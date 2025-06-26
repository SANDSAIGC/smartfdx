#!/usr/bin/env node

/**
 * Next.js 性能分析脚本
 * 测量启动时间并识别性能瓶颈
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Next.js 性能分析工具');
console.log('================================');

// 分析项目结构
function analyzeProjectStructure() {
  console.log('\n📊 项目结构分析:');
  
  const stats = {
    totalFiles: 0,
    jsFiles: 0,
    tsFiles: 0,
    cssFiles: 0,
    componentFiles: 0,
    pageFiles: 0,
    apiFiles: 0
  };

  function countFiles(dir, basePath = '') {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const relativePath = path.join(basePath, file);
        
        // 跳过 node_modules, .next, .git 等目录
        if (['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
          return;
        }
        
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          countFiles(filePath, relativePath);
        } else {
          stats.totalFiles++;
          
          const ext = path.extname(file).toLowerCase();
          if (ext === '.js' || ext === '.jsx') stats.jsFiles++;
          if (ext === '.ts' || ext === '.tsx') stats.tsFiles++;
          if (ext === '.css' || ext === '.scss' || ext === '.sass') stats.cssFiles++;
          
          // 分析特定目录
          if (relativePath.includes('components')) stats.componentFiles++;
          if (relativePath.includes('app') && (ext === '.tsx' || ext === '.ts')) stats.pageFiles++;
          if (relativePath.includes('api')) stats.apiFiles++;
        }
      });
    } catch (err) {
      // 忽略权限错误
    }
  }

  countFiles(process.cwd());
  
  console.log(`   总文件数: ${stats.totalFiles}`);
  console.log(`   JavaScript文件: ${stats.jsFiles}`);
  console.log(`   TypeScript文件: ${stats.tsFiles}`);
  console.log(`   CSS文件: ${stats.cssFiles}`);
  console.log(`   组件文件: ${stats.componentFiles}`);
  console.log(`   页面文件: ${stats.pageFiles}`);
  console.log(`   API文件: ${stats.apiFiles}`);
  
  return stats;
}

// 分析依赖项
function analyzeDependencies() {
  console.log('\n📦 依赖项分析:');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    
    console.log(`   生产依赖: ${Object.keys(deps).length}`);
    console.log(`   开发依赖: ${Object.keys(devDeps).length}`);
    
    // 识别大型依赖项
    const largeDeps = [];
    const allDeps = { ...deps, ...devDeps };
    
    // 已知的大型依赖项
    const knownLargeDeps = [
      '@supabase/supabase-js',
      'next',
      'react',
      'typescript',
      'eslint',
      '@types/node'
    ];
    
    knownLargeDeps.forEach(dep => {
      if (allDeps[dep]) {
        largeDeps.push(dep);
      }
    });
    
    if (largeDeps.length > 0) {
      console.log('   大型依赖项:');
      largeDeps.forEach(dep => {
        console.log(`     - ${dep}: ${allDeps[dep]}`);
      });
    }
    
    return { deps: Object.keys(deps).length, devDeps: Object.keys(devDeps).length, largeDeps };
  } catch (err) {
    console.log('   ❌ 无法读取 package.json');
    return null;
  }
}

// 检查缓存状态
function analyzeCacheStatus() {
  console.log('\n💾 缓存状态分析:');
  
  const cacheDirectories = [
    '.next',
    'node_modules/.cache',
    '.eslintcache'
  ];
  
  cacheDirectories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        const stat = fs.statSync(dirPath);
        const size = getDirSize(dirPath);
        console.log(`   ${dir}: 存在 (${formatBytes(size)})`);
      } catch (err) {
        console.log(`   ${dir}: 存在 (无法读取大小)`);
      }
    } else {
      console.log(`   ${dir}: 不存在`);
    }
  });
}

// 计算目录大小
function getDirSize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          totalSize += getDirSize(filePath);
        } else {
          totalSize += stat.size;
        }
      } catch (err) {
        // 忽略权限错误
      }
    });
  } catch (err) {
    // 忽略权限错误
  }
  
  return totalSize;
}

// 格式化字节数
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 测量启动时间
function measureStartupTime() {
  return new Promise((resolve) => {
    console.log('\n⏱️  启动时间测量:');
    console.log('   正在启动 Next.js 开发服务器...');
    
    const startTime = Date.now();
    let readyTime = null;
    
    const child = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });

    child.stdout.on('data', (data) => {
      const output = data.toString();
      
      // 检测启动完成的标志
      if (output.includes('Ready in') || output.includes('✓ Ready') || output.includes('started server')) {
        if (!readyTime) {
          readyTime = Date.now();
          const duration = readyTime - startTime;
          console.log(`   ✅ 启动完成! 耗时: ${duration}ms (${(duration/1000).toFixed(2)}秒)`);
          
          // 等待一秒后关闭服务器
          setTimeout(() => {
            child.kill('SIGTERM');
            resolve(duration);
          }, 1000);
        }
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Error') || output.includes('Failed')) {
        console.log(`   ❌ 启动错误: ${output.trim()}`);
      }
    });

    child.on('error', (err) => {
      console.log(`   ❌ 进程错误: ${err.message}`);
      resolve(null);
    });

    // 超时处理 (30秒)
    setTimeout(() => {
      if (!readyTime) {
        console.log('   ⏰ 启动超时 (30秒)');
        child.kill('SIGTERM');
        resolve(null);
      }
    }, 30000);
  });
}

// 生成性能报告
function generatePerformanceReport(startupTime, projectStats, depStats) {
  console.log('\n📋 性能分析报告:');
  console.log('================================');
  
  // 启动时间评估
  if (startupTime) {
    const seconds = startupTime / 1000;
    console.log(`🚀 启动时间: ${seconds.toFixed(2)}秒`);
    
    if (seconds < 10) {
      console.log('   ✅ 优秀 (目标: <10秒)');
    } else if (seconds < 20) {
      console.log('   ⚠️  一般 (建议优化)');
    } else {
      console.log('   ❌ 较慢 (需要优化)');
    }
  }
  
  // 项目复杂度评估
  if (projectStats) {
    console.log(`📁 项目规模: ${projectStats.totalFiles} 文件`);
    if (projectStats.totalFiles > 200) {
      console.log('   ⚠️  大型项目，考虑代码分割');
    }
  }
  
  // 依赖项评估
  if (depStats) {
    const totalDeps = depStats.deps + depStats.devDeps;
    console.log(`📦 依赖项数量: ${totalDeps}`);
    if (totalDeps > 50) {
      console.log('   ⚠️  依赖项较多，检查是否有不必要的包');
    }
  }
  
  // 优化建议
  console.log('\n💡 优化建议:');
  
  if (startupTime && startupTime > 10000) {
    console.log('   1. 启动时间超过10秒，建议:');
    console.log('      - 启用 Turbopack (npm run dev:turbo)');
    console.log('      - 检查大型依赖项');
    console.log('      - 优化 TypeScript 配置');
  }
  
  if (depStats && depStats.largeDeps.length > 0) {
    console.log('   2. 大型依赖项优化:');
    console.log('      - 考虑动态导入');
    console.log('      - 检查是否可以移除不必要的依赖');
  }
  
  console.log('   3. 通用优化:');
  console.log('      - 清理 .next 缓存');
  console.log('      - 增加 Node.js 内存限制');
  console.log('      - 使用 SWC 编译器');
}

// 主函数
async function main() {
  const projectStats = analyzeProjectStructure();
  const depStats = analyzeDependencies();
  analyzeCacheStatus();
  
  const startupTime = await measureStartupTime();
  
  generatePerformanceReport(startupTime, projectStats, depStats);
}

// 运行分析
main().catch(console.error);
