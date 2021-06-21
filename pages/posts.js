import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSeo } from '@/components/SEO'

import { defineMessage, useIntl } from 'react-intl'

export const POSTS_PER_PAGE = 5

export async function getStaticProps({ locale, locales, defaultLocale }) {
  const { getAllFilesFrontMatter } = await import('@/lib/mdx')
  const getPosts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale)
  const posts = getPosts.splice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(getPosts.length / POSTS_PER_PAGE) + 1,
  }

  return { props: { posts, pagination } }
}

export default function Blog({ posts, pagination }) {
  const intl = useIntl()

  const messages = { id: 'posts', description: undefined, defaultMessage: undefined }
  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'posts' })}
        description={intl.formatMessage({ id: 'descPostsPage' }, { blogName: siteMetadata.title })}
        url={`/posts`}
      />
      <ListLayout
        posts={posts}
        pagination={pagination}
        title={intl.formatMessage(messages)}
        isPosts
      />
    </>
  )
}
