#!/usr/bin/env node

/**
 * 快速启动脚本 - 优化 Next.js 开发服务器启动速度
 * 版本: 2.0 - 增强性能优化
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 SmartFDX 快速启动脚本 v2.0');
console.log('================================');

// 检查系统资源
function checkSystemResources() {
  const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024);
  const freeMem = Math.round(os.freemem() / 1024 / 1024 / 1024);
  const cpuCount = os.cpus().length;

  console.log(`💻 系统资源检查:`);
  console.log(`   CPU核心数: ${cpuCount}`);
  console.log(`   总内存: ${totalMem}GB`);
  console.log(`   可用内存: ${freeMem}GB`);

  if (freeMem < 2) {
    console.log('   ⚠️  可用内存不足，可能影响性能');
  }

  return { totalMem, freeMem, cpuCount };
}

// 杀死占用端口的进程
function killPortProcesses() {
  return new Promise((resolve) => {
    console.log('🔍 检查端口占用...');

    const ports = [3000, 3001, 3008];
    let completed = 0;

    ports.forEach(port => {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
              exec(`taskkill /F /PID ${pid}`, (killError) => {
                if (!killError) {
                  console.log(`   ✓ 已终止端口 ${port} 的进程 (PID: ${pid})`);
                }
              });
            }
          });
        }

        completed++;
        if (completed === ports.length) {
          setTimeout(resolve, 1000); // 等待进程完全终止
        }
      });
    });
  });
}

// 深度清理缓存
function deepCleanCache() {
  console.log('🧹 深度清理缓存...');

  const cacheDirectories = [
    '.next',
    'node_modules/.cache',
    '.eslintcache',
    '.swc',
    'dist',
    'build'
  ];

  cacheDirectories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`   ✓ 清理: ${dir}`);
      }
    } catch (err) {
      console.log(`   ⚠️  跳过: ${dir} (${err.message})`);
    }
  });

  // 清理临时文件
  const tempFiles = [
    'tsconfig.tsbuildinfo',
    '.eslintcache'
  ];

  tempFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   ✓ 删除: ${file}`);
      }
    } catch (err) {
      // 忽略错误
    }
  });
}

// 优化环境变量
function getOptimizedEnv(systemInfo) {
  const memoryLimit = Math.min(systemInfo.totalMem * 1024 * 0.7, 8192); // 使用70%内存，最大8GB

  return {
    ...process.env,
    // Next.js 优化
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_PRIVATE_SKIP_VALIDATION: '1',

    // Node.js 优化
    NODE_OPTIONS: `--max-old-space-size=${Math.round(memoryLimit)} --max-semi-space-size=128`,
    NODE_ENV: 'development',

    // 编译优化
    FAST_REFRESH: 'true',
    TURBOPACK: '1',
    SWC_DISABLE_NEXT_CACHE: '1',

    // TypeScript 优化
    TSC_NONPOLLING_WATCHER: 'true',
    TSC_WATCHFILE: 'UseFsEvents',

    // 缓存优化
    NEXT_CACHE_DISABLED: '1',

    // 开发优化
    FORCE_COLOR: '1',
    CI: '0'
  };
}

// 启动开发服务器
function startDevServer(systemInfo) {
  console.log('🔧 启动 Next.js 开发服务器...');
  console.log('   使用 Turbopack 加速编译');

  const optimizedEnv = getOptimizedEnv(systemInfo);

  // 优先使用 Turbopack
  const child = spawn('npm', ['run', 'dev:turbo'], {
    stdio: 'inherit',
    shell: true,
    env: optimizedEnv
  });

  child.on('error', (err) => {
    console.error('❌ Turbopack 启动失败，回退到标准模式:', err.message);

    // 回退到标准模式
    const fallbackChild = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: optimizedEnv
    });

    setupChildProcessHandlers(fallbackChild);
  });

  setupChildProcessHandlers(child);
}

// 设置子进程处理器
function setupChildProcessHandlers(child) {
  child.on('close', (code) => {
    if (code !== 0) {
      console.log(`❌ 进程退出，代码: ${code}`);
    }
  });

  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n👋 正在关闭开发服务器...');
    child.kill('SIGINT');
    process.exit(0);
  });

  // 处理进程终止
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    process.exit(0);
  });
}

// 主函数
async function main() {
  try {
    const systemInfo = checkSystemResources();

    await killPortProcesses();
    deepCleanCache();

    console.log('\n⚡ 性能优化已启用:');
    console.log('   • 遥测数据收集已禁用');
    console.log(`   • 内存限制: ${Math.round(systemInfo.totalMem * 0.7)}GB`);
    console.log('   • Turbopack 编译器已启用');
    console.log('   • 快速刷新已启用');
    console.log('   • 深度缓存清理完成');
    console.log('   • 端口冲突已解决');
    console.log('   • TypeScript 监听优化');
    console.log('');

    startDevServer(systemInfo);
  } catch (error) {
    console.error('❌ 启动脚本执行失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
main();
