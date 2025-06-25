// 生成新的JWT密钥
// 使用Node.js运行: node scripts/generate-new-jwt.js

const crypto = require('crypto');

// 生成一个新的强随机JWT密钥
function generateJWTSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// 使用指定的JWT密钥生成anon和service role tokens
function generateTokens(jwtSecret) {
  // 简单的JWT实现（仅用于生成）
  function base64UrlEncode(str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  function createJWT(payload, secret) {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + (365 * 24 * 60 * 60); // 1年后过期

  const anonPayload = {
    role: 'anon',
    iss: 'supabase',
    iat: now,
    exp: exp
  };

  const servicePayload = {
    role: 'service_role',
    iss: 'supabase',
    iat: now,
    exp: exp
  };

  return {
    anonKey: createJWT(anonPayload, jwtSecret),
    serviceKey: createJWT(servicePayload, jwtSecret)
  };
}

// 使用当前的JWT密钥
const currentJWTSecret = '6d4k6jQ2WgOB8SwjwzLGAdmIzkQyi2r3';
console.log('当前JWT密钥:', currentJWTSecret);

const tokens = generateTokens(currentJWTSecret);

console.log('\n=== 重新生成的JWT密钥 ===');
console.log('JWT_SECRET:', currentJWTSecret);
console.log('\nANON_KEY:');
console.log(tokens.anonKey);
console.log('\nSERVICE_ROLE_KEY:');
console.log(tokens.serviceKey);

console.log('\n=== 更新.env.local文件 ===');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=' + tokens.anonKey);
console.log('SUPABASE_SERVICE_ROLE_KEY=' + tokens.serviceKey);

// 生成一个全新的JWT密钥作为备选
const newJWTSecret = generateJWTSecret();
const newTokens = generateTokens(newJWTSecret);

console.log('\n=== 备选方案：全新JWT密钥 ===');
console.log('新JWT_SECRET:', newJWTSecret);
console.log('\n新ANON_KEY:');
console.log(newTokens.anonKey);
console.log('\n新SERVICE_ROLE_KEY:');
console.log(newTokens.serviceKey);
