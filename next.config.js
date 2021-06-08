const localeData = require('./locale-data')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  future: {
    webpack5: true,
  },
  i18n: Object.assign({}, localeData, { localeDetection: false }),
  webpack: (config, { dev, isServer }) => {
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
    return [
      {
        source: '/js/kryptonite.js',
        destination: 'https://tr.n4o.xyz/js/plausible.js',
      },
      {
        source: '/api/event',
        destination: 'https://tr.n4o.xyz/api/event',
      },
      /**
       * Old redirect for Hugo
       */
      {
        source: '/blog/:slug',
        destination: '/posts/:slug',
      },
      {
        source: '/r/:slug',
        destination: 'https://shigoto.n4o.xyz/r/:slug',
      },
      {
        source: '/release/:slug',
        destination: 'https://shigoto.n4o.xyz/release/:slug',
      },
    ]
  },
})
