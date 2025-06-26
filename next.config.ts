import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 实验性功能优化
  experimental: {
    // 优化包导入
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-dropdown-menu',
      'date-fns'
    ],
    // 减少编译时间
    esmExternals: true,
  },

  // Turbopack 配置 (Next.js 15+ 稳定版)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // TypeScript 配置优化
  typescript: {
    // 在生产构建时忽略类型错误以加快构建
    ignoreBuildErrors: false,
  },

  // Webpack 配置 (仅在非 Turbopack 模式下使用)
  webpack: (config, { dev, isServer }) => {
    // 只在开发环境且未使用 Turbopack 时应用优化
    if (dev && !process.env.TURBOPACK) {
      // 优化文件监听
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.vscode/**',
          '**/coverage/**'
        ],
        // 减少轮询频率
        poll: 1000,
        // 聚合变更以减少重新编译
        aggregateTimeout: 300,
      };

      // 优化解析
      config.resolve.symlinks = false;

      // 缓存优化
      config.cache = {
        type: 'filesystem',
        cacheDirectory: '.next/cache/webpack',
        buildDependencies: {
          config: [__filename],
        },
      };

      // 减少模块解析时间
      config.resolve.modules = ['node_modules'];

      // 优化 chunk 分割
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        };
      }
    }

    return config;
  },

  // 编译器优化
  compiler: {
    // 移除 console.log (仅在生产环境)
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 图片优化
  images: {
    // 禁用图片优化以加快开发速度
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // 输出配置
  output: 'standalone',

  // 压缩配置
  compress: false, // 开发环境禁用压缩

  // 开发指示器配置 - 修复左下角N悬浮按钮无限刷新问题
  devIndicators: {
    position: "bottom-right", // 指示器位置设置为右下角
  },
};

export default nextConfig;
