import Link from '@/components/Link'
import { PageSeo } from '@/components/SEO'
import Tag from '@/components/Tag'
import SpotifyHubSkeleton from '@/components/SpotifyHubSkeleton'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { DateTime } from 'luxon'

import remark from 'remark'
import markdown from 'remark-parse'
import html from 'remark-html'

import React from 'react'
import { useIntl } from 'react-intl'

const postDateTemplate = { year: 'numeric', month: 'long', day: 'numeric' }

export async function getStaticProps({ locale, locales, defaultLocale }) {
  const posts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale)

  return { props: { posts } }
}

function summaryFormatter(textData) {
  if (textData.replace(/\s/g) === '') {
    return ''
  }
  const result = remark().use(markdown).use(html).processSync(textData)
  return result.toString()
}

class SpotifyNow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      loading: true,
      error: false,
    }
  }

  async componentDidMount() {
    const response = await fetch('/api/now')
    if (response.status !== 200) {
      this.setState({ error: true, loading: false, data: { playing: false } })
      return
    }
    const data = await response.json()
    this.setState({ data, loading: false })
  }

  render() {
    const { data, loading, error } = this.state
    if (error) {
      return null
    }
    const mainData = data.data || {}
    const { playing } = data

    return (
      <div>
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h2 className="text-xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-4xl md:leading-14">
            Spotify
          </h2>
          {!loading && playing && (
            <p className="!-mt-1 text-gray-400 dark:text-gray-500 tracking-wide">Now playing</p>
          )}
        </div>
        <div className="flex flex-col w-full max-w-full">
          {loading ? (
            <SpotifyHubSkeleton />
          ) : (
            <>
              {playing ? (
                <div className="flex flex-col items-center md:flex-row md:items-start gap-4">
                  <div className="relative">
                    <img
                      className="h-96 rounded-lg !shadow-lg ring-4 ring-offset-green-500 ring-green-500"
                      src={mainData.album.url}
                      alt={`${mainData.album.name} Album Art`}
                    />
                  </div>
                  <div className="flex flex-col text-center md:text-left gap-2">
                    <div>
                      <Link
                        href={mainData.url}
                        className="hover:underline text-2xl md:text-3xl lg:text-4xl font-bold"
                      >
                        {mainData.title}
                      </Link>
                    </div>
                    <div className="font-semibold text-gray-600 dark:text-gray-500 text-xl md:text-2xl">
                      {mainData.album.name} by {mainData.artist.join(', ')}
                    </div>
                    <div className="font-light text-gray-400 dark:text-gray-500">
                      {DateTime.fromSQL(mainData.album.date).toLocaleString(DateTime.DATE_FULL)}
                    </div>
                  </div>
                </div>
              ) : (
                <h3 className="text-gray-800 dark:text-gray-200 font-medium text-xl">
                  Not playing anything
                </h3>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
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
          {posts.slice(0, 1).map((frontMatter) => {
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
                        <div
                          className="prose text-gray-500 max-w-none dark:text-gray-400"
                          dangerouslySetInnerHTML={{ __html: summaryFormatter(summary) }}
                        />
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
      {posts.length > 1 && (
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
      <SpotifyNow />
    </>
  )
}
