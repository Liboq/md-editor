import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用 Webpack 5 的 Worker 支持
  webpack: (config, { isServer }) => {
    // 客户端构建时配置 Worker
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
