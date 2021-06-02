import fs from 'fs'
import path from 'path'
import { kebabCase } from '@/lib/utils'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSeo } from '@/components/SEO'
import { useIntl } from 'react-intl'

const root = process.cwd()

export async function getStaticPaths({ locales, defaultLocale }) {
  const tags = await getAllTags('blog', undefined, locales, defaultLocale, true)

  const allPaths = []
  for (const [loc, locData] of Object.entries(tags)) {
    for (const [tagName, tagData] of Object.entries(locData)) {
      allPaths.push({
        params: {
          tag: tagName,
        },
        locale: loc,
      })
    }
  }

  return {
    paths: allPaths,
    fallback: false,
  }
}

export async function getStaticProps({ params, locale, locales, defaultLocale }) {
  const allPosts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale)
  const filteredPosts = allPosts.filter(
    (post) => post.draft !== true && post.tags.map((t) => kebabCase(t)).includes(params.tag)
  )

  return { props: { posts: filteredPosts, tag: params.tag } }
}

export default function Tag({ posts, tag }) {
  const intl = useIntl()
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  return (
    <>
      <PageSeo
        title={`#${tag} - Tags`}
        description={intl.formatMessage({ id: 'descTaggedPage' }, { tag: tag })}
        url={`/tags/${tag}`}
      />
      <ListLayout posts={posts} title={title} />
    </>
  )
}
