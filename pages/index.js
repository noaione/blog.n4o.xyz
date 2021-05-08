import Link from '@/components/Link'
import { PageSeo } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'

import { useIntl } from 'react-intl'

const MAX_DISPLAY = 5
const postDateTemplate = { year: 'numeric', month: 'long', day: 'numeric' }

export async function getStaticProps({ locale }) {
  const posts = await getAllFilesFrontMatter('blog', locale)

  return { props: { posts } }
}

export default function Home({ posts }) {
  const intl = useIntl()

  const descriptors = {
    latest: {
      id: 'latest',
      description: undefined,
      defaultMessage: undefined,
    },
    readMore: {
      id: 'readMore',
      description: undefined,
      defaultMessage: undefined,
    },
    allPosts: {
      id: 'allPosts',
      description: undefined,
      defaultMessage: undefined,
    },
    siteDesc: {
      id: 'siteDesc',
      description: undefined,
      defaultMessage: undefined,
    },
    searchArticle: {
      id: 'searchArticle',
      description: undefined,
      defaultMessage: undefined,
    },
    noArticle: {
      id: 'noArticle',
      description: undefined,
      defaultMessage: undefined,
    },
  }

  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'home' })}
        description={siteMetadata.description}
        url={siteMetadata.siteUrl}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {intl.formatMessage(descriptors.latest)}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {intl.formatMessage(descriptors.siteDesc)}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && <p className="mt-2">{intl.formatMessage(descriptors.noArticle)}</p>}
          {posts.slice(0, MAX_DISPLAY).map((frontMatter) => {
            const { slug, date, title, summary, tags } = frontMatter
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>
                          {new Date(date).toLocaleDateString(intl.locale, postDateTemplate)}
                        </time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link
                              href={`/posts/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose text-gray-500 max-w-none dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={`/posts/${slug}`}
                          className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                          aria-label={`${intl.locale === 'en' ? 'Read' : 'Baca'} "${title}"`}
                        >
                          {intl.formatMessage(descriptors.readMore)} &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/posts"
            className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label={intl.formatMessage(descriptors.readMore).toLowerCase()}
          >
            {intl.formatMessage(descriptors.allPosts)} &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
