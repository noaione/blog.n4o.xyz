/* eslint-disable no-prototype-builtins */
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const prettier = require('prettier')
const matter = require('gray-matter')
const luxon = require('luxon')

const remark = require('remark')
const markdown = require('remark-parse')
const html = require('remark-html')

const siteMetadata = require('../data/siteMetadata')
const localeData = require('../locale-data')

const LocaleEn = require('../locale/en')
const LocaleId = require('../locale/id')

const LocaleLanguages = {
  id: LocaleId,
  en: LocaleEn,
}

function markdownToHTML(contents) {
  const result = remark().use(markdown).use(html).processSync(contents)
  return result.toString()
}

const convertStringToHTML = (string) =>
  string.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

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

function findFirstLine(textData) {
  for (let i = 0; i < textData.length; i++) {
    const clean = textData[i].replace(/\r/, '')
    if (clean.replace(/\s/, '').length > 0) {
      return clean
    }
  }
  return ''
}

function formatSeparators(textData, separators) {
  if (typeof separators !== 'string') {
    return findFirstLine(textData)
  }
  const joinedText = []
  for (let i = 0; i < textData.length; i++) {
    const clean = textData[i].replace(/\r/, '')
    if (clean === separators) {
      break
    }
    joinedText.push(clean)
  }
  // Bruh
  if (joinedText.length === textData.length) {
    return findFirstLine(textData)
  }
  return joinedText.join('\n')
}

function excerptFormatter(file, options) {
  file.excerpt = formatSeparators(file.content.split('\n'), options.excerpt_separator)
}

function dateSortDesc(a, b) {
  if (a > b) return -1
  if (a < b) return 1
  return 0
}

function generateRSSXMLItem(post, basePath, locale = 'en', defaultLocale = 'en') {
  const postPath = basePath + 'posts/' + post.slug
  let lbd
  if (post.hasOwnProperty('lastmod')) {
    lbd = new Date(post.lastmod).toUTCString()
  } else if (post.hasOwnProperty('date')) {
    lbd = new Date(post.date).toUTCString()
  } else {
    lbd = new Date().toUTCString()
  }
  const { images } = post
  let featured
  if (Array.isArray(images) && images.length > 0) {
    featured = images[0]
    if (featured.startsWith('/')) {
      featured = `${basePath.slice(0, basePath.length - 1)}${featured}`
    }
  }

  return `
    <item>
      <title>${convertStringToHTML(post.title)}</title>
      ${
        post.summary
          ? `<description><![CDATA[${convertStringToHTML(
              markdownToHTML(post.summary)
            ).trim()}]]></description>`
          : ''
      }
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${siteMetadata.author}</author>${
    typeof featured === 'string' ? `\n      <media:thumbnail url="${featured}" />` : ''
  }${
    typeof featured === 'string' ? `\n      <media:content url="${featured}" medium="image" />` : ''
  }
      <link>${postPath}</link>
      <guid>${postPath}</guid>
      ${post.tags
        .map((tag) => {
          return `<category>${tag}</category>`
        })
        .join('\n      ')}
    </item>`
}

function generateRSSXML(validPosts, locale = 'en', defaultLocale = 'en') {
  let basePath = siteMetadata.siteUrl + '/'
  if (locale !== localeData.defaultLocale) {
    basePath += locale + '/'
  }

  const firstPost = validPosts[0]
  let lbd
  if (firstPost.hasOwnProperty('lastmod')) {
    lbd = new Date(firstPost.lastmod).toUTCString()
  } else if (firstPost.hasOwnProperty('date')) {
    lbd = new Date(firstPost.date).toUTCString()
  } else {
    lbd = new Date().toUTCString()
  }

  return `
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
  <channel>
    <title>${convertStringToHTML(siteMetadata.title)}</title>
    <link>${basePath}</link>
    <description>${convertStringToHTML(
      LocaleLanguages[locale]?.tagLine || siteMetadata.description
    )}</description>
    <language>${locale}</language>
    <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
    <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
    <lastBuildDate>${lbd}</lastBuildDate>
    <generator>NextJS/Vercel</generator>
    <atom:link href="${basePath}index.xml" rel="self" type="application/rss+xml" />
    ${validPosts
      .map((post) => {
        return generateRSSXMLItem(post, basePath, locale, defaultLocale)
      })
      .join('')}
  </channel>
</rss>
  `
}

;(async () => {
  const prettierConfig = await prettier.resolveConfig('./.prettierrc.js')
  const pages = await globby(['data/**/*.mdx', 'data/**/*.md'])

  const currentTime = luxon.DateTime.now().toUTC().toISO()

  const allPosts = pages.filter((e) => e.startsWith('data/blog'))
  const preparedPosts = []
  allPosts.forEach((post) => {
    const fnSplit = tryToSplitPath(post)
    const [dateFromFile, fileItself] = parseSlug(fnSplit[fnSplit.length - 1])
    const slug = fileItself.replace(/\.(mdx|md)/, '')
    const fileName = fnSplit[fnSplit.length - 1] || slug
    const realLocale = findLocaleVersion(fnSplit, localeData.locales) || localeData.defaultLocale
    const src = fs.readFileSync(path.join(process.cwd(), post))
    const { data, excerpt } = matter(src, {
      excerpt: excerptFormatter,
      excerpt_separator: '<!--more-->',
    })
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('date') && dateFromFile) {
      data.date = dateFromFile
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('locale')) {
      data.locale = realLocale
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('summary')) {
      data.summary = excerpt
    }
    const allTags = []
    if (Array.isArray(data.tags)) {
      data.tags.forEach((tag) => {
        const formattedTags = kebabCase(tag)
        allTags.push(formattedTags)
      })
    }
    preparedPosts.push({
      ...data,
      slug: fileItself.replace(/\.(mdx|md)/, ''),
      locale: data.locale,
      tags: allTags,
      fileName,
    })
  })

  const allRSSLocaleFormatted = {}
  localeData.locales.forEach((locale) => {
    let lastBuildDate
    let validPosts = []
    preparedPosts.forEach((post) => {
      if (locale === post.locale) {
        validPosts.push(post)
      }
    })
    validPosts = validPosts.sort((a, b) => dateSortDesc(a.date, b.date))
    if (validPosts.length < 1) {
      return
    }
    validPosts = validPosts.filter((post) => !post.draft);
    const rssData = generateRSSXML(validPosts, locale, localeData.defaultLocale)

    // const formatted = prettier.format(rssData, {
    //   ...prettierConfig,
    //   parser: 'html',
    // })
    allRSSLocaleFormatted[locale] = rssData
  })

  for (let [key, value] of Object.entries(allRSSLocaleFormatted)) {
    let fullPath = `${key}/index.xml`
    let useLocalePath = key
    if (key === localeData.defaultLocale) {
      fullPath = 'index.xml'
      useLocalePath = ''
    }
    await fs.promises.mkdir(`public/${useLocalePath}`, { recursive: true })
    console.info(`[RSSGen] Generating RSS data for locale \`${key}\``)
    fs.writeFileSync(`public/${fullPath}`, value)
  }
})()
