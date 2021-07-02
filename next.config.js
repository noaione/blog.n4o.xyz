const localeData = require('./locale-data')

const withPlugins = require('next-compose-plugins')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withTM = require('next-transpile-modules')(['unist-util-visit'])

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  i18n: Object.assign({}, localeData, { localeDetection: false }),
  images: {
    domains: ['cdn.discordapp.com'],
  },
  webpack: (config, { dev, isServer }) => {
    config.module.rules.push({
      test: /\.mdx$/,
      use: [{ loader: 'xdm/webpack.cjs', options: {} }],
    })
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|mp4)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next',
            name: 'static/media/[name].[hash].[ext]',
          },
        },
      ],
    })

    if (!isServer) {
      config.resolve.fallback.fs = false
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    if (!dev && !isServer) {
      // Replace React with Preact only in client production build
      Object.assign(config.resolve.alias, {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      })
    }

    return config
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/js/kryptonite.js',
          destination: 'https://tr.n4o.xyz/js/plausible.js',
        },
        {
          source: '/api/event',
          destination: 'https://tr.n4o.xyz/api/event',
        },
        {
          source: '/blog/:slug',
          destination: '/api/oldredir/blog/:slug',
        },
        {
          source: '/r/:slug',
          destination: '/api/oldredir/r/:slug',
        },
        {
          source: '/release/:slug',
          destination: '/api/oldredir/release/:slug',
        },
      ],
    }
  },
}

module.exports = withPlugins([[withBundleAnalyzer], [withTM]], nextConfig)
