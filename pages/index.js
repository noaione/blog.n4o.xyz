import Link from '@/components/Link'
import { PageSeo } from '@/components/SEO'
import Tag from '@/components/Tag'
import SpotifyHubSkeleton from '@/components/SpotifyHubSkeleton'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { durationToText } from '@/lib/utils'

import remark from 'remark'
import markdown from 'remark-parse'
import html from 'remark-html'
import { DateTime } from 'luxon'

import React, { useEffect, useState } from 'react'
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

class TimerLoader extends React.Component {
  constructor(props) {
    super(props)
    const { current } = props
    this.state = {
      current,
    }
  }

  componentDidMount() {
    const outerThis = this
    this.timerState = setInterval(() => {
      this.setState(
        (prev) => ({ current: prev.current + 1 }),
        () => {
          if (outerThis.state.current >= outerThis.props.total) {
            if (this.timerState) {
              clearInterval(this.timerState)
            }
            if (outerThis.props && typeof outerThis.props.onFinished === 'function') {
              outerThis.props.onFinished()
            }
          }
        }
      )
    }, 1000)
  }

  componentWillUnmount() {
    if (this.timerState) {
      clearInterval(this.timerState)
    }
  }

  render() {
    let { current } = this.state
    const { total } = this.props
    if (current >= total && this.timerState) {
      clearInterval(this.timerState)
      current = total
    }

    return (
      <div className="font-light text-gray-400 dark:text-gray-500">
        {durationToText(current)}/{durationToText(total)}
      </div>
    )
  }
}

class SpotifyNow extends React.Component {
  constructor(props) {
    super(props)
    this.refreshData = this.refreshData.bind(this)
    this.state = {
      data: {},
      loading: true,
      firstTime: true,
      error: false,
    }
  }

  async componentDidMount() {
    await this.refreshData()
    this.setState({ firstTime: false })
    this.timerData = setInterval(() => {
      const { data, loading } = this.state
      if (data && !data.playing && !loading) {
        this.refreshData()
          .then(() => {
            return
          })
          .catch(() => {
            return
          })
      }
    }, 30 * 1000)
  }

  componentWillUnmount() {
    if (this.timerData) {
      clearInterval(this.timerData)
    }
  }

  async refreshData() {
    this.setState({ loading: true })
    const response = await fetch('/api/now')
    if (response.status !== 200) {
      this.setState({ error: true, loading: false, data: { playing: false } })
      return
    }
    const data = await response.json()
    this.setState({ data, loading: false })
  }

  render() {
    const { localesData, locale } = this.props
    const { data, loading, error, firstTime } = this.state
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
            <div className="!-mt-0.5 flex flex-row items-center gap-2">
              <img
                className="w-6 h-6"
                src="https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/3x"
                alt="PepeJam"
              />
              <p className="text-gray-400 dark:text-gray-500 tracking-wide">{localesData.play}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col w-full max-w-full">
          {loading && firstTime ? (
            <SpotifyHubSkeleton />
          ) : (
            <>
              {playing ? (
                <div className="flex flex-col items-center md:flex-row md:items-start gap-4">
                  <div className="relative">
                    <a href={mainData.url} rel="noopener noreferrer" target="_blank">
                      <img
                        className="h-96 rounded-lg !shadow-lg ring-4 ring-offset-green-500 ring-green-500"
                        src={mainData.album.url}
                        alt={`${mainData.album.name} Album Art`}
                      />
                    </a>
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
                      {mainData.album.name} {localesData.by} {mainData.artist.join(', ')}
                    </div>
                    <div className="font-light text-gray-400 dark:text-gray-500">
                      {DateTime.fromSQL(mainData.album.date)
                        .setLocale(locale)
                        .toLocaleString(DateTime.DATE_FULL)}
                    </div>
                    <TimerLoader
                      current={mainData.progress / 1000}
                      total={mainData.duration / 1000}
                      onFinished={() =>
                        setTimeout(() => {
                          this.refreshData()
                            .then(() => {
                              return
                            })
                            .catch(() => {
                              return
                            })
                        }, 2000)
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 168 168">
                    <path
                      fill="#1ED760"
                      d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l.001-.004zm38.404 120.78a5.217 5.217 0 01-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 01-6.249-3.93 5.213 5.213 0 013.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35a6.538 6.538 0 014.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-.001zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 015.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 012.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z"
                    ></path>
                  </svg>
                  <h3 className="text-gray-800 dark:text-gray-200 font-medium text-xl">
                    {localesData.stop}
                  </h3>
                </div>
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
    spotifyListening: {
      id: 'spotifyListening',
    },
    spotifyNotPlaying: {
      id: 'spotifyNotPlaying',
    },
    spotifyAlbumBy: {
      id: 'spotifyAlbumBy',
    },
  }

  const spotifyDataLocales = {
    play: intl.formatMessage(descriptors.spotifyListening),
    stop: intl.formatMessage(descriptors.spotifyNotPlaying),
    by: intl.formatMessage(descriptors.spotifyAlbumBy),
  }

  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'home' })}
        description={intl.formatMessage(descriptors.siteDesc)}
        url={'/'}
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
            const { slug, date, title, summary, tags, images } = frontMatter
            let selectedImages
            if (Array.isArray(images) && images.length > 0) {
              selectedImages = images[0]
            }
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline">
                    <dl style={{ alignSelf: 'flex-start' }}>
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
                            {selectedImages && (
                              <div className="prose">
                                <img
                                  className="max-w-full"
                                  style={{ marginBottom: '0.5rem' }}
                                  src={selectedImages}
                                  alt="Featured blog post data"
                                />
                              </div>
                            )}
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
      <SpotifyNow locale={intl.locale} localesData={spotifyDataLocales} />
    </>
  )
}
