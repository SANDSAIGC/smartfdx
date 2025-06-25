const jwt = require('jsonwebtoken');

// JWT密钥（从.env.local获取）
const JWT_SECRET = '6d4k6jQ2WgOB8SwjwzLGAdmIzkQyi2r3';

// 生成anon密钥
const anonPayload = {
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1年后过期
};

// 生成service_role密钥
const servicePayload = {
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1年后过期
};

try {
  const anonToken = jwt.sign(anonPayload, JWT_SECRET);
  const serviceToken = jwt.sign(servicePayload, JWT_SECRET);
  
  console.log('=== 新生成的JWT密钥 ===');
  console.log('ANON KEY:');
  console.log(anonToken);
  console.log('');
  console.log('SERVICE ROLE KEY:');
  console.log(serviceToken);
  console.log('');
  console.log('请更新.env.local文件中的密钥');
  
} catch (error) {
  console.error('生成JWT密钥失败:', error);
}
