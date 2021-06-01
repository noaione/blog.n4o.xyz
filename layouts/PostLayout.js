import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { BlogSeo } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import React, { useEffect } from 'react'

import { useIntl } from 'react-intl'
import useSWR from 'swr'

const editUrl = (fileName) => `${siteMetadata.siteRepo}/blob/master/data/blog/${fileName}`
const discussUrl = (slug) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(
    `${siteMetadata.siteUrl}/posts/${slug}`
  )}`

const postDateTemplate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

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

    return (
      <div className="py-4 xl:py-8">
        <h2 className="text-s tracking-wide text-gray-500 uppercase dark:text-gray-400">
          Now playing
        </h2>
        <div className="flex flex-row items-center gap-1 mt-1">
          <svg className="h-4 w-4 ml-auto" viewBox="0 0 168 168">
            <path
              fill="#1ED760"
              d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l.001-.004zm38.404 120.78a5.217 5.217 0 01-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 01-6.249-3.93 5.213 5.213 0 013.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35a6.538 6.538 0 014.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-.001zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 015.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 012.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z"
            ></path>
          </svg>
          <div className="flex flex-col sm:flex-row w-full max-w-full">
            {loading ? (
              <p className="text-gray-800 dark:text-gray-200 font-medium whitespace-pre-line">
                Loading playing data...
              </p>
            ) : (
              <>
                {error ? (
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    Failed to get now "playing" data
                  </p>
                ) : (
                  <>
                    {data.playing ? (
                      <Link
                        href={data.data.url}
                        className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {data.data.artist.join(', ')} – {data.data.title}
                      </Link>
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        Not playing anything
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default function PostLayout({ children, frontMatter, next, prev }) {
  const { slug, fileName, date, title, tags, readingTime } = frontMatter
  const intl = useIntl()
  // const { data, error } = useSWR(['/api/now?mock=1', (url) => fetcher(url)])
  const data = { url: '/', playing: false }
  const error = false
  useEffect(() => {
    console.info('Refreshing....')
  }, [])

  const descriptors = {
    authors: {
      id: 'authors',
    },
    tags: {
      id: 'tags',
    },
    prev: {
      id: 'previousArticle',
    },
    next: {
      id: 'nextArticle',
    },
    back: {
      id: 'goBack',
    },
    readingTime: {
      id: 'readingTime',
    },
    readingTimeLessThan: {
      id: 'readingTimeLessThan',
    },
  }

  const rtmMin = readingTime.minutes
  let readingTimeText = Math.ceil(rtmMin).toString()
  if (rtmMin < 1) {
    readingTimeText = intl.formatMessage(descriptors.readingTimeLessThan)
  }

  const readTimeText = intl.formatMessage(descriptors.readingTime, {
    minutes: readingTimeText,
  })

  return (
    <>
      <SectionContainer>
        <BlogSeo url={`${siteMetadata.siteUrl}/posts/${frontMatter.slug}`} {...frontMatter} />
        <article>
          <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
            <header className="pt-6 xl:pb-6">
              <div className="space-y-1 text-center">
                <dl className="space-y-10">
                  <div>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>
                        {new Date(date).toLocaleDateString(intl.locale, postDateTemplate)}
                      </time>
                    </dd>
                  </div>
                </dl>
                <div>
                  <PageTitle>{title}</PageTitle>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{readTimeText}</p>
                </div>
              </div>
            </header>
            <div
              className="pb-8 divide-y divide-gray-200 xl:divide-y-0 dark:divide-gray-700 xl:grid xl:grid-cols-4 xl:gap-x-6"
              style={{ gridTemplateRows: 'auto 1fr' }}
            >
              <dl className="pt-6 pb-10 xl:pt-11 xl:border-b xl:border-gray-200 xl:dark:border-gray-700">
                <dt className="sr-only">{intl.formatMessage(descriptors.authors)}</dt>
                <dd>
                  <ul className="flex justify-center space-x-8 xl:block sm:space-x-12 xl:space-x-0 xl:space-y-8">
                    <li className="flex items-center space-x-2">
                      <img
                        src={siteMetadata.image}
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <dl className="text-sm font-medium leading-5 whitespace-nowrap">
                        <dt className="sr-only">Name</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{siteMetadata.author}</dd>
                        <dt className="sr-only">Twitter</dt>
                        <dd>
                          <Link
                            href={siteMetadata.twitter}
                            className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {siteMetadata.twitter.replace('https://twitter.com/', '@')}
                          </Link>
                        </dd>
                      </dl>
                    </li>
                  </ul>
                </dd>
              </dl>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:pb-0 xl:col-span-3 xl:row-span-2">
                <div className="pt-10 pb-8 prose dark:prose-dark max-w-none">{children}</div>
                <div className="pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
                  <Link href={discussUrl(slug)} rel="nofollow">
                    {'Discuss on Twitter'}
                  </Link>
                  {` • `}
                  <Link href={editUrl(fileName)}>{'View on GitHub'}</Link>
                </div>
              </div>
              <footer>
                <div className="text-sm font-medium leading-5 divide-gray-200 xl:divide-y dark:divide-gray-700 xl:col-start-1 xl:row-start-2">
                  {tags && (
                    <div className="py-4 xl:py-8">
                      <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        {intl.formatMessage(descriptors.tags)}
                      </h2>
                      <div className="flex flex-wrap">
                        {tags.map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>
                    </div>
                  )}
                  <SpotifyNow />
                  <>
                    {(next || prev) && (
                      <div className="flex justify-between py-4 xl:block xl:py-8 xl:space-y-8">
                        {prev && (
                          <div>
                            <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                              {intl.formatMessage(descriptors.prev)}
                            </h2>
                            <div className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                              <Link href={`/posts/${prev.slug}`}>{prev.title}</Link>
                            </div>
                          </div>
                        )}
                        {next && (
                          <div>
                            <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                              {intl.formatMessage(descriptors.next)}
                            </h2>
                            <div className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                              <Link href={`/posts/${next.slug}`}>{next.title}</Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href="/posts"
                      className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      &larr; {intl.formatMessage(descriptors.back)}
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </article>
      </SectionContainer>
    </>
  )
}
