const localeData = require('./locale-data');

const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const withTM = require('next-transpile-modules')(['unist-util-visit']);

const localeInformation = Object.assign({}, localeData, { localeDetection: false });

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  eslint: {
    dirs: ['pages', 'components', 'lib', 'layouts'],
  },
  i18n: localeInformation,
  images: {
    domains: ['cdn.discordapp.com'],
  },
  productionBrowserSourceMaps: true,
  swcLoader: true,
  swcMinify: true,
  esmExternals: true,
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
    });

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    if (!dev && !isServer) {
      // Replace React with Preact only in client production build
      Object.assign(config.resolve.alias, {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      });
    }

    return config;
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
    };
  },
};

module.exports = withPlugins([[withBundleAnalyzer], [withTM]], nextConfig);
