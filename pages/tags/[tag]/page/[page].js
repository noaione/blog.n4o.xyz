import { kebabCase } from '@/lib/utils'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSeo } from '@/components/SEO'
import { useIntl } from 'react-intl'
import { POSTS_PER_PAGE } from '..'

export async function getStaticPaths({ locales, defaultLocale }) {
  const { getAllTags } = await import('@/lib/tags')
  const tags = await getAllTags('blog', undefined, locales, defaultLocale, true)

  let allPaths = []
  for (const [loc, locData] of Object.entries(tags)) {
    for (const [tagName, tagData] of Object.entries(locData)) {
      const totalPages = Math.ceil(tagData.count / POSTS_PER_PAGE)
      const paths = Array.from({ length: totalPages }, (_, i) => ({
        params: {
          tag: tagName,
          page: '' + (i + 1),
        },
        locale: loc,
      }))
      allPaths = allPaths.concat(paths)
    }
  }

  return {
    paths: allPaths,
    fallback: false,
  }
}

export async function getStaticProps({ params, locale, locales, defaultLocale }) {
  const { getAllFilesFrontMatter } = await import('@/lib/mdx')
  const { tag, page } = params
  const allPosts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale)
  const filteredPosts = allPosts.filter(
    (post) => post.draft !== true && post.tags.map((t) => kebabCase(t)).includes(tag)
  )
  const pageNumber = parseInt(page)
  const postsPerPage = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(filteredPosts.length / POSTS_PER_PAGE),
  }

  return { props: { posts: postsPerPage, pagination, tag } }
}

export default function Tag({ posts, tag, pagination }) {
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
      <ListLayout posts={posts} title={title} pagination={pagination} />
    </>
  )
}
