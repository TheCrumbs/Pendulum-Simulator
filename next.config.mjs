/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  basePath: '',
  trailingSlash: true,
  reactStrictMode: true,
  output: 'export',
  distDir: 'out',
}

export default nextConfig