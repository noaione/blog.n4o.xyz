import { getAllFilesFrontMatter } from '@/lib/mdx'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSeo } from '@/components/SEO'

import { defineMessage, useIntl } from 'react-intl'

export async function getStaticProps({ locale }) {
  const posts = await getAllFilesFrontMatter('blog', locale)

  return { props: { posts } }
}

export default function Blog({ posts }) {
  const intl = useIntl()

  const messages = { id: 'posts', description: undefined, defaultMessage: undefined }
  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'posts' })}
        description={siteMetadata.description}
        url={`${siteMetadata.siteUrl}/posts`}
      />
      <ListLayout posts={posts} title={intl.formatMessage(messages)} />
    </>
  )
}
