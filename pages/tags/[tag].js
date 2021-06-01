import fs from 'fs'
import path from 'path'
import { kebabCase } from '@/lib/utils'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSeo } from '@/components/SEO'
import generateRss from '@/lib/generate-rss'

const root = process.cwd()

export async function getStaticPaths({ locales, defaultLocale }) {
  const tags = await getAllTags('blog', undefined, locales, defaultLocale)

  return {
    paths: Object.entries(tags).map(([tag, n]) => ({
      params: {
        tag: tag,
      },
      locale: n.locale,
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params, locale, locales, defaultLocale }) {
  const allPosts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale)
  const filteredPosts = allPosts.filter(
    (post) => post.draft !== true && post.tags.map((t) => kebabCase(t)).includes(params.tag)
  )

  // rss
  const rss = generateRss(filteredPosts, `tags/${params.tag}/index.xml`, locale)
  const rssPath = path.join(root, 'public', 'tags', params.tag)
  fs.mkdirSync(rssPath, { recursive: true })
  fs.writeFileSync(path.join(rssPath, 'index.xml'), rss)

  return { props: { posts: filteredPosts, tag: params.tag } }
}

export default function Tag({ posts, tag }) {
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  return (
    <>
      <PageSeo
        title={`#${tag} - Tags`}
        description={`#${tag} tags - ${siteMetadata.title}`}
        url={`${siteMetadata.siteUrl}/tags/${tag}`}
      />
      <ListLayout posts={posts} title={title} />
    </>
  )
}
