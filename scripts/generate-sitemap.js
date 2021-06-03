const fs = require('fs')
const path = require('path')
const globby = require('globby')
const prettier = require('prettier')
const matter = require('gray-matter')
const luxon = require('luxon')
const siteMetadata = require('../data/siteMetadata')
const localeData = require('../locale-data')

const kebabCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join('-')

function parseSlug(slugName) {
  // eslint-disable-next-line no-useless-escape
  const re = /([0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2})?\-?(.*)/i
  const parsed = slugName.match(re)
  if (parsed === null) {
    return [undefined, slugName]
  }
  return [parsed[1], parsed[2]]
}

function findLocaleVersion(paths, locales = ['en', 'id']) {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    if (locales.includes(path)) {
      return path
    }
  }
  return null
}

function tryToSplitPath(paths) {
  let splitForward = paths.split('/')
  if (splitForward.length === 1) {
    let splitBack = paths.split('\\')
    if (splitBack.length > 1) {
      return splitBack
    }
  }
  return splitForward
}

function formatDateToYMD(dateData) {
  const month = dateData.getUTCMonth().toString().padStart(2, '0')
  const days = dateData.getUTCDay().toString().padStart(2, '0')
  return `${dateData.getUTCFullYear()}-${month}-${days}`
}

;(async () => {
  const prettierConfig = await prettier.resolveConfig('./.prettierrc.js')
  const pages = await globby([
    'pages/*.js',
    'data/**/*.mdx',
    'data/**/*.md',
    '!pages/_*.js',
    '!pages/api',
  ])

  const currentTime = luxon.DateTime.now().toUTC().toISO()

  const allPosts = pages.filter((e) => e.startsWith('data/blog'))
  const otherPages = pages.filter((e) => !allPosts.includes(e))
  const preparedPosts = []
  allPosts.forEach((post) => {
    const fnSplit = tryToSplitPath(post)
    const [dateFromFile, fileItself] = parseSlug(fnSplit[fnSplit.length - 1])
    const realLocale = findLocaleVersion(fnSplit, localeData.locales) || localeData.defaultLocale
    const src = fs.readFileSync(path.join(process.cwd(), post))
    const { data } = matter(src)
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('date') && dateFromFile) {
      data.date = dateFromFile
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('locale')) {
      data.locale = realLocale
    }
    const allTags = []
    if (Array.isArray(data.tags)) {
      data.tags.forEach((tag) => {
        const formattedTags = kebabCase(tag)
        allTags.push(formattedTags)
      })
    }
    preparedPosts.push({
      slug: fileItself.replace(/\.(mdx|md)/, ''),
      locale: data.locale,
      tags: allTags,
    })
  })

  const allMergedTags = {}

  function uniq(a) {
    let seen = {}
    return a.filter((item) => {
      // eslint-disable-next-line no-prototype-builtins
      return seen.hasOwnProperty(item) ? false : (seen[item] = true)
    })
  }

  preparedPosts.forEach((post) => {
    // eslint-disable-next-line no-prototype-builtins
    if (!allMergedTags.hasOwnProperty(post.locale)) {
      allMergedTags[post.locale] = []
    }
    const allT = [].concat(allMergedTags[post.locale], post.tags)
    allMergedTags[post.locale] = uniq(allT)
  })

  const sitemapMaps = `
  <?xml version="1.0" encoding="utf-8" standalone="yes"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${localeData.locales
    .map((loc) => {
      return `
      <sitemap>
        <loc>${siteMetadata.siteUrl}/sitemap.${loc}.xml</loc>
        <lastmod>${currentTime}</lastmod>
      </sitemap>`
    })
    .join('')}
  </sitemapindex>
  `

  const allSitemapsFormatted = {}
  localeData.locales.forEach((locale) => {
    let allTagsLocale = allMergedTags[locale]
    if (!Array.isArray(allTagsLocale)) {
      allTagsLocale = []
    }
    const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
      ${otherPages
        .map((page) => {
          const path = page
            .replace('pages/', '/')
            .replace('data/blog', '/posts')
            .replace('public/', '/')
            .replace('.js', '')
            .replace('.mdx', '')
            .replace('.md', '')
            .replace('/index.xml', '')
          const route = path === '/index' ? '' : path
          let locRoute = '/' + locale
          if (locale === localeData.defaultLocale) {
            locRoute = ''
          }
          if (route === '/404' || route === '/500') {
            return undefined
          }
          return `
          <url>
            <loc>${`${siteMetadata.siteUrl}${locRoute}${route}`}</loc>
            <lastmod>${currentTime}</lastmod>
            ${localeData.locales
              .map((lc) => {
                const path = page
                  .replace('pages/', '/')
                  .replace('data/blog', '/posts')
                  .replace('public/', '/')
                  .replace('.js', '')
                  .replace('.mdx', '')
                  .replace('.md', '')
                  .replace('/index.xml', '')
                let route = path === '/index' ? '' : path
                if (lc !== localeData.defaultLocale) {
                  route = `/${lc}` + route
                }
                return `<xhtml:link rel="alternate" hreflang="${lc}" href="${`${siteMetadata.siteUrl}${route}`}" />
                `
              })
              .join('')}
          </url>`
        })
        .filter((e) => typeof e === 'string')
        .join('')}
      ${preparedPosts
        .map((post) => {
          if (post.locale !== locale) {
            return undefined
          }
          let route = '/posts/' + post.slug
          if (post.locale !== localeData.defaultLocale) {
            route = '/' + post.locale + route
          }
          return `<url>
          <loc>${`${siteMetadata.siteUrl}${route}`}</loc>
          <lastmod>${currentTime}</lastmod>
          ${localeData.locales
            .map((e) => {
              let rr = route
              if (e !== post.locale) {
                rr = '/posts/' + post.slug
                if (e !== localeData.defaultLocale) {
                  rr = '/' + e + rr
                }
              }
              return `<xhtml:link rel="alternate" hreflang="${e}" href="${`${siteMetadata.siteUrl}${rr}`}" />
            `
            })
            .join('')}
        </url>`
        })
        .filter((e) => typeof e === 'string')
        .join('\n')}
      ${allTagsLocale
        .map((tag) => {
          let route = '/tags/' + tag
          if (locale !== localeData.defaultLocale) {
            route = '/' + locale + route
          }
          return `<url>
            <loc>${`${siteMetadata.siteUrl}${route}`}</loc>
            <lastmod>${currentTime}</lastmod>
          </url>
          `
        })
        .join('')}
    </urlset>
    `
    const formatted = prettier.format(sitemap, {
      ...prettierConfig,
      parser: 'html',
    })
    allSitemapsFormatted[locale] = formatted
  })

  const formattedMainXML = prettier.format(sitemapMaps, {
    ...prettierConfig,
    parser: 'html',
  })

  console.info('[SitemapGen] Generating the main XML file...')
  // eslint-disable-next-line no-sync
  fs.writeFileSync('public/sitemap.xml', formattedMainXML)
  for (let [key, value] of Object.entries(allSitemapsFormatted)) {
    console.info(`[SitemapGen] Generating Localized (${key}) XML file...`)
    fs.writeFileSync(`public/sitemap.${key}.xml`, value)
  }
})()
