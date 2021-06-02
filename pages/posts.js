import { getAllFilesFrontMatter } from '@/lib/mdx'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSeo } from '@/components/SEO'

import { defineMessage, useIntl } from 'react-intl'

export async function getStaticProps({ locale, locales, defaultLocale }) {
  const posts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale)

  return { props: { posts } }
}

export default function Blog({ posts }) {
  const intl = useIntl()

  const messages = { id: 'posts', description: undefined, defaultMessage: undefined }
  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'posts' })}
        description={intl.formatMessage({ id: 'descPostsPage' }, { blogName: siteMetadata.title })}
        url={`/posts`}
      />
      <ListLayout posts={posts} title={intl.formatMessage(messages)} isPosts />
    </>
  )
}
