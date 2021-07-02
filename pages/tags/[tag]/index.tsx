import { kebabCase } from '@/lib/utils'
import ListLayout from '@/layouts/ListLayout'
import { FrontMatterData, PageSeo } from '@/components/SEO'
import { useIntl } from 'react-intl'
import { GetStaticPathsContext, GetStaticPropsContext } from 'next'
import { PaginationProps } from '@/components/Pagination'

export const POSTS_PER_PAGE = 5

export async function getStaticPaths({ locales, defaultLocale }: GetStaticPathsContext) {
  const { getAllTags } = await import('@/lib/tags')
  const tags = await getAllTags('blog', undefined, locales, defaultLocale, true)

  const allPaths = []
  for (const [loc, locData] of Object.entries(tags)) {
    for (const tagName of Object.keys(locData)) {
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

export async function getStaticProps({
  params,
  locale,
  locales,
  defaultLocale,
}: GetStaticPropsContext) {
  const { getAllFilesFrontMatter } = await import('@/lib/mdx')
  const allPosts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale)
  const filteredPosts = allPosts.filter(
    (post) =>
      post.draft !== true && post.tags.map((t) => kebabCase(t)).includes(params.tag as string)
  )
  const posts = filteredPosts.splice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(filteredPosts.length / POSTS_PER_PAGE) + 1,
  }

  return { props: { posts, pagination, tag: params.tag } }
}

interface TagPageProps {
  posts: FrontMatterData[]
  tag: string
  pagination: PaginationProps
}

export default function Tag({ posts, tag, pagination }: TagPageProps) {
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
