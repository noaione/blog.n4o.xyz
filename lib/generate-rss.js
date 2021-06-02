import siteMetadata from '@/data/siteMetadata'

import LocaleEn from '@/locale/en'
import LocaleId from '@/locale/id'

const LocaleLanguages = {
  id: LocaleId,
  en: LocaleEn,
}

const generateRssItem = (post, locale = 'en', defaultLocale = 'en') => `
  <item>
    <guid>${siteMetadata.siteUrl}${locale !== defaultLocale ? '/' + locale : ''}/posts/${
  post.slug
}</guid>
    <title>${post.title}</title>
    <link>${siteMetadata.siteUrl}${locale !== defaultLocale ? '/' + locale : ''}/posts/${
  post.slug
}</link>
    <description>${post.summary}</description>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${siteMetadata.email} (${siteMetadata.author})</author>
    ${post.tags.map((t) => `<category>${t}</category>`).join('\n    ')}
  </item>
`

const generateRss = (posts, page = 'index.xml', locale = 'en', defaultLocale = 'en') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${siteMetadata.title}</title>
      <link>${siteMetadata.siteUrl}${locale !== defaultLocale ? '/' + locale : ''}/posts</link>
      <description>${LocaleLanguages[locale]?.tagLine || siteMetadata.description}</description>
      <language>${locale}</language>
      <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
      <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${siteMetadata.siteUrl}/${page}" rel="self" type="application/rss+xml" />
      ${posts.map((val) => generateRssItem(val, locale, defaultLocale)).join('')}
    </channel>
  </rss>
`
export default generateRss
