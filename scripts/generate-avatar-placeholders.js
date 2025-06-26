#!/usr/bin/env node

/**
 * 生成头像占位符文件
 * 由于我们无法生成真实图片，这里创建SVG格式的头像占位符
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 生成头像占位符文件');
console.log('===================');

// 头像配置
const avatarConfigs = [
  { id: 'avatar1', bg: '#3B82F6', icon: '👤', name: '默认头像1' },
  { id: 'avatar2', bg: '#EF4444', icon: '🧑', name: '默认头像2' },
  { id: 'avatar3', bg: '#10B981', icon: '👩', name: '默认头像3' },
  { id: 'avatar4', bg: '#8B5CF6', icon: '👨', name: '默认头像4' },
  { id: 'avatar5', bg: '#F59E0B', icon: '🧑‍💼', name: '默认头像5' },
  { id: 'avatar6', bg: '#EC4899', icon: '👩‍💼', name: '默认头像6' },
];

// 生成SVG头像
function generateSVGAvatar(config) {
  return `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="32" fill="${config.bg}"/>
  <text x="32" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">${config.icon}</text>
</svg>`;
}

// 创建头像文件
function createAvatarFiles() {
  const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
  
  // 确保目录存在
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
    console.log('✅ 创建 avatars 目录');
  }
  
  // 生成每个头像文件
  avatarConfigs.forEach(config => {
    const svgContent = generateSVGAvatar(config);
    const filePath = path.join(avatarsDir, `${config.id}.svg`);
    
    try {
      fs.writeFileSync(filePath, svgContent);
      console.log(`✅ 生成头像: ${config.id}.svg - ${config.name}`);
    } catch (error) {
      console.error(`❌ 生成头像失败: ${config.id}`, error.message);
    }
  });
}

// 创建头像配置文件
function createAvatarConfig() {
  const configPath = path.join(process.cwd(), 'public', 'avatars', 'config.json');
  
  const config = {
    version: '1.0.0',
    avatars: avatarConfigs.map(avatar => ({
      id: avatar.id,
      name: avatar.name,
      url: `/avatars/${avatar.id}.svg`,
      type: 'svg'
    }))
  };
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ 生成头像配置文件: config.json');
  } catch (error) {
    console.error('❌ 生成配置文件失败:', error.message);
  }
}

// 更新头像选择器组件
function updateAvatarSelector() {
  console.log('\n📝 更新建议:');
  console.log('============');
  console.log('头像文件已生成，建议更新 AvatarSelector 组件中的 PRESET_AVATARS 配置：');
  console.log('');
  console.log('const PRESET_AVATARS = [');
  avatarConfigs.forEach(config => {
    console.log(`  { id: '${config.id}', url: '/avatars/${config.id}.svg', name: '${config.name}' },`);
  });
  console.log('];');
}

// 主函数
function main() {
  try {
    createAvatarFiles();
    createAvatarConfig();
    updateAvatarSelector();
    
    console.log('\n🎉 头像占位符生成完成！');
    console.log('📁 文件位置: public/avatars/');
    console.log('🔧 请根据需要替换为真实的头像图片');
    
  } catch (error) {
    console.error('❌ 生成过程中出现错误:', error.message);
  }
}

// 运行生成器
main();
