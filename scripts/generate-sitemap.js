const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const matter = require('gray-matter');
const luxon = require('luxon');
const siteMetadata = require('../data/siteMetadata');
const localeData = require('../locale-data');

const kebabCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join('-');

function parseSlug(slugName) {
  // eslint-disable-next-line no-useless-escape
  const re = /([0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2})?\-?(.*)/i;
  const parsed = slugName.match(re);
  if (parsed === null) {
    return [undefined, slugName];
  }
  return [parsed[1], parsed[2]];
}

function findLocaleVersion(paths, locales = ['en', 'id']) {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    if (locales.includes(path)) {
      return path;
    }
  }
  return null;
}

function tryToSplitPath(paths) {
  let splitForward = paths.split('/');
  if (splitForward.length === 1) {
    let splitBack = paths.split('\\');
    if (splitBack.length > 1) {
      return splitBack;
    }
  }
  return splitForward;
}

(async () => {
  const manifestPath = path.join(__dirname, '..', '.next', 'prerender-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(
      '[SiteMapGen] Unable to find prerender-manifest, please build your project first!'
    );
    return;
  }
  const buildManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const prettierConfig = await prettier.resolveConfig('./.prettierrc.js');
  const globby = await import('globby');
  const pages = await globby.globby([
    'pages/*.js',
    'pages/*.ts',
    'pages/*.tsx',
    'pages/*.jsx',
    'data/**/*.mdx',
    'data/**/*.md',
    '!pages/_*.js',
    '!pages/_*.jsx',
    '!pages/_*.ts',
    '!pages/_*.tsx',
    '!pages/api',
  ]);

  const currentTime = luxon.DateTime.now().toUTC().toISO();

  const allPosts = pages.filter((e) => e.startsWith('data/blog'));
  const otherPages = pages.filter((e) => !allPosts.includes(e));
  const paginatedRoutes = [];
  for (const path of Object.keys(buildManifest.routes)) {
    if (path.includes('/page/')) {
      paginatedRoutes.push(path);
    }
  }
  const paginatedRoutesPerLocale = {};
  for (const route of paginatedRoutes) {
    const routeSplit = route.split('/').filter((e) => e !== '');
    const theLocale = routeSplit[0];
    if (localeData.locales.includes(theLocale)) {
      if (!(theLocale in paginatedRoutesPerLocale)) {
        paginatedRoutesPerLocale[theLocale] = [];
      }
      if (theLocale === localeData.defaultLocale) {
        paginatedRoutesPerLocale[theLocale].push('/' + routeSplit.slice(1).join('/'));
      } else {
        paginatedRoutesPerLocale[theLocale].push(route);
      }
    }
  }
  const preparedPosts = [];
  allPosts.forEach((post) => {
    const fnSplit = tryToSplitPath(post);
    const [dateFromFile, fileItself] = parseSlug(fnSplit[fnSplit.length - 1]);
    const realLocale = findLocaleVersion(fnSplit, localeData.locales) || localeData.defaultLocale;
    const src = fs.readFileSync(path.join(process.cwd(), post));
    const { data } = matter(src);
    if (data.draft) {
      return;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('date') && dateFromFile) {
      data.date = dateFromFile;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('locale')) {
      data.locale = realLocale;
    }
    const allTags = [];
    if (Array.isArray(data.tags)) {
      data.tags.forEach((tag) => {
        const formattedTags = kebabCase(tag);
        allTags.push(formattedTags);
      });
    }
    preparedPosts.push({
      slug: fileItself.replace(/\.(mdx|md)/, ''),
      locale: data.locale,
      tags: allTags,
    });
  });

  const allMergedTags = {};

  function uniq(a) {
    let seen = {};
    return a.filter((item) => {
      // eslint-disable-next-line no-prototype-builtins
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
  }

  preparedPosts.forEach((post) => {
    // eslint-disable-next-line no-prototype-builtins
    if (!allMergedTags.hasOwnProperty(post.locale)) {
      allMergedTags[post.locale] = [];
    }
    const allT = [].concat(allMergedTags[post.locale], post.tags);
    allMergedTags[post.locale] = uniq(allT);
  });

  const sitemapMaps = `
  <?xml version="1.0" encoding="utf-8" standalone="yes"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${localeData.locales
    .map((loc) => {
      return `
      <sitemap>
        <loc>${siteMetadata.siteUrl}/sitemap.${loc}.xml</loc>
        <lastmod>${currentTime}</lastmod>
      </sitemap>`;
    })
    .join('')}
  </sitemapindex>
  `;

  const allSitemapsFormatted = {};
  localeData.locales.forEach((locale) => {
    let allTagsLocale = allMergedTags[locale];
    if (!Array.isArray(allTagsLocale)) {
      allTagsLocale = [];
    }
    const allPaginatedLocale = paginatedRoutesPerLocale[locale] || [];
    const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
      ${otherPages
        .map((page) => {
          const path = page
            .replace('pages/', '/')
            .replace('data/blog', '/posts')
            .replace('public/', '/')
            .replace('.tsx', '')
            .replace('.jsx', '')
            .replace('.js', '')
            .replace('.ts', '')
            .replace('.mdx', '')
            .replace('.md', '')
            .replace('/index.xml', '');
          let route = path === '/index' ? '' : path;
          if (!route.startsWith('/') && route !== '') {
            route = `/${route}`;
          }
          let baseRoute = '/' + locale;
          if (locale === localeData.defaultLocale) {
            baseRoute = '';
          }
          if (route.startsWith('/404') || route.startsWith('/500')) {
            return undefined;
          }

          const maxPriority = 1.0;
          const lowestPriority = 0.4;
          const step = (maxPriority - lowestPriority) / 10;
          // Determine page priority
          // check by how many slugs the route has
          let priority = maxPriority;
          const routeSplit = route.split('/').filter((e) => e !== '');
          if (routeSplit.length > 1) {
            for (let i = 0; i < routeSplit.length; i++) {
              priority -= step;
            }
          }

          priority = priority.toFixed(2);

          return `
          <url>
            <loc>${`${siteMetadata.siteUrl}${baseRoute}${route}`}</loc>
            <lastmod>${currentTime}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>${priority}</priority>
          </url>`;
        })
        .filter((e) => typeof e === 'string')
        .join('')}
      ${preparedPosts
        .map((post) => {
          if (post.locale !== locale) {
            return undefined;
          }
          let route = '/posts/' + post.slug;
          if (post.locale !== localeData.defaultLocale) {
            route = '/' + post.locale + route;
          }

          const maxPriority = 1.0;
          const lowestPriority = 0.4;
          const step = (maxPriority - lowestPriority) / 10;
          // Determine page priority
          // check by how many slugs the route has
          let priority = maxPriority;
          const routeSplit = route
            .split('/')
            .filter((e) => e !== '')
            // dont include locale
            .filter((e) => e !== locale);
          if (routeSplit.length > 1) {
            for (let i = 0; i < routeSplit.length; i += 1) {
              priority -= step;
            }
          }
          // round to 2 decimals
          priority = priority.toFixed(2);
          return `<url>
          <loc>${`${siteMetadata.siteUrl}${route}`}</loc>
          <lastmod>${currentTime}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>${priority}</priority>
        </url>`;
        })
        .filter((e) => typeof e === 'string')
        .join('\n')}
      ${allPaginatedLocale
        .map((route) => {
          const maxPriority = 0.65;
          const lowestPriority = 0.25;
          const step = (maxPriority - lowestPriority) / 10;
          // Determine page priority
          // check by how many slugs the route has
          let priority = maxPriority;
          const routeSplit = route.split('/').filter((e) => e !== '');
          if (routeSplit.length > 1) {
            for (let i = 0; i < routeSplit.length; i += 1) {
              priority -= step;
            }
          }
          // round to 2 decimals
          priority = priority.toFixed(2);
          return `<url>
          <loc>${`${siteMetadata.siteUrl}${route}`}</loc>
          <lastmod>${currentTime}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>${priority}</priority>
        </url>`;
        })
        .join('')}
      ${allTagsLocale
        .map((tag) => {
          let route = '/tags/' + tag;
          if (locale !== localeData.defaultLocale) {
            route = '/' + locale + route;
          }

          const maxPriority = 0.8;
          const lowestPriority = 0.4;
          const step = (maxPriority - lowestPriority) / 10;
          // Determine page priority
          // check by how many slugs the route has
          let priority = maxPriority;
          const routeSplit = route.split('/').filter((e) => e !== '');
          if (routeSplit.length > 1) {
            for (let i = 0; i < routeSplit.length; i++) {
              priority -= step;
            }
          }

          priority = priority.toFixed(2);
          return `<url>
            <loc>${`${siteMetadata.siteUrl}${route}`}</loc>
            <lastmod>${currentTime}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>${priority}</priority>
          </url>
          `;
        })
        .join('')}
    </urlset>
    `;
    const formatted = prettier.format(sitemap, {
      ...prettierConfig,
      parser: 'html',
    });
    allSitemapsFormatted[locale] = formatted;
  });

  const formattedMainXML = prettier.format(sitemapMaps, {
    ...prettierConfig,
    parser: 'html',
  });

  console.info('[SitemapGen] Generating the main XML file...');
  // eslint-disable-next-line no-sync
  fs.writeFileSync('public/sitemap.xml', formattedMainXML);
  for (let [key, value] of Object.entries(allSitemapsFormatted)) {
    console.info(`[SitemapGen] Generating Localized (${key}) XML file...`);
    fs.writeFileSync(`public/sitemap.${key}.xml`, value);
  }
})();
