import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ SSR용 standalone 빌드 설정
  output: "standalone",

  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // ✅ 이미지 최적화 비활성화 (Cloudtype 환경 대비)
    unoptimized: true,
  },
  output: "standalone",

  webpack: (config) => {
    // ✅ 절대경로 alias 설정
    config.resolve.alias["@"] = resolve(__dirname);
    return config;
  },
};

export default nextConfig;
