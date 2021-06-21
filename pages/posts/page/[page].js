import { PageSeo } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { POSTS_PER_PAGE } from '../../posts'
import { useIntl } from 'react-intl'

export async function getStaticPaths({ locales, defaultLocale }) {
  const { getFiles } = await import('@/lib/mdx')
  const totalPosts = await getFiles('blog', '*', locales, defaultLocale)
  const groupedByLocales = {}
  totalPosts.forEach((post) => {
    // eslint-disable-next-line no-prototype-builtins
    if (!groupedByLocales.hasOwnProperty(post.locale)) {
      groupedByLocales[post.locale] = []
    }
    groupedByLocales[post.locale].push(post)
  })

  let mergedPaths = []
  Object.entries(groupedByLocales).forEach(([localeName, postCollection]) => {
    const totalPages = Math.ceil(postCollection.length / POSTS_PER_PAGE)
    const paths = Array.from({ length: totalPages }, (_, i) => ({
      params: { page: '' + (i + 1) },
      locale: localeName,
    }))
    mergedPaths = mergedPaths.concat(paths)
  })

  return {
    paths: mergedPaths,
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const { getAllFilesFrontMatter } = await import('@/lib/mdx')
  const {
    params: { page },
    locale,
    locales,
    defaultLocale,
  } = context
  const getPosts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale)
  const pageNumber = parseInt(page)
  const postsPerPage = getPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(getPosts.length / POSTS_PER_PAGE),
  }

  return {
    props: {
      postsPerPage,
      pagination,
    },
  }
}

export default function PostPage({ postsPerPage, pagination }) {
  const intl = useIntl()

  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'posts' })}
        description={intl.formatMessage({ id: 'descPostsPage' }, { blogName: siteMetadata.title })}
        url={`/posts/${pagination.currentPage}`}
      />
      <ListLayout
        posts={postsPerPage}
        pagination={pagination}
        title={intl.formatMessage({ id: 'posts' })}
      />
    </>
  )
}
