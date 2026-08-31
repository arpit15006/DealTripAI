import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  /**
   * Agent discovery lives at a well-known path so a buyer agent that has only
   * the origin can find the marketplace. The App Router will not route a
   * directory whose name begins with a dot, so it is served by a normal route
   * handler and rewritten into place.
   */
  async rewrites() {
    return [
      { source: '/.well-known/agent-commerce.json', destination: '/api/agent/index' },
      { source: '/.well-known/agent-commerce', destination: '/api/agent/index' }
    ]
  }
}

export default nextConfig
