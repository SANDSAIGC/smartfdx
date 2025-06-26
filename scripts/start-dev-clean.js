#!/usr/bin/env node

/**
 * 开发服务器启动脚本
 * 确保干净的启动环境
 */

const { spawn } = require('child_process');

console.log('🚀 启动 Next.js 开发服务器');
console.log('========================');

// 设置环境变量
process.env.NODE_ENV = 'development';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// 启动开发服务器
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

devServer.on('error', (error) => {
  console.error('❌ 启动开发服务器失败:', error);
});

devServer.on('close', (code) => {
  console.log(`🔚 开发服务器已关闭，退出码: ${code}`);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭开发服务器...');
  devServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭开发服务器...');
  devServer.kill('SIGTERM');
});

console.log('💡 提示:');
console.log('- 服务器启动后，访问 http://localhost:3002');
console.log('- 使用 Ctrl+C 停止服务器');
console.log('- 如果端口被占用，服务器会自动选择其他端口');
