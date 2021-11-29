/* eslint-disable @next/next/no-img-element */
import Comments from '@/components/Comments';
import Link from '@/components/Link';
import PageTitle from '@/components/PageTitle';
import SectionContainer from '@/components/SectionContainer';
import { BlogSeo, FrontMatterData } from '@/components/SEO';
import Tag from '@/components/Tag';
import TimerLoader from '@/components/TimerLoader';
import siteMetadata from '@/data/siteMetadata.json';
import React from 'react';

import { useIntl } from 'react-intl';

const editUrl = (fileName: string, locale = 'en') =>
  `${siteMetadata.siteRepo}/blob/master/data/blog/${locale}/${fileName}`;

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

interface SpotifyLocalesString {
  play: string;
  stop: string;
  by: string;
  load: string;
  err: string;
}

interface SpotifyNowState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  loading: boolean;
  firstTime: boolean;
  error: boolean;
}

interface SpotifyNowProps {
  localesData: SpotifyLocalesString;
  currentLocale: string;
}

class SpotifyNow extends React.Component<SpotifyNowProps, SpotifyNowState> {
  timerData?: NodeJS.Timeout;

  constructor(props: SpotifyNowProps) {
    super(props);
    this.refreshData = this.refreshData.bind(this);
    this.state = {
      data: {},
      loading: true,
      firstTime: true,
      error: false,
    };
  }

  async componentDidMount() {
    await this.refreshData();
    this.timerData = setInterval(() => {
      const { data, loading } = this.state;
      if (data && !data.playing && !loading) {
        this.refreshData()
          .then(() => {
            return;
          })
          .catch(() => {
            return;
          });
      }
    }, 30 * 1000);
  }

  componentWillUnmount() {
    if (this.timerData) {
      clearInterval(this.timerData);
    }
  }

  async refreshData() {
    if (this.state.firstTime) {
      this.setState({ loading: true });
    }
    const response = await fetch('/api/now');
    if (response.status !== 200) {
      this.setState({ error: true, loading: false, data: { playing: false }, firstTime: false });
      return;
    }
    const data = await response.json();
    this.setState({ data, loading: false, firstTime: false });
  }

  render() {
    const { localesData, currentLocale } = this.props;
    const { data, loading, error } = this.state;

    return (
      <div className="py-4 xl:py-8">
        <h2 className="text-s tracking-wide text-gray-500 uppercase dark:text-gray-400">
          {localesData.play}
        </h2>
        <div className="flex flex-row items-start gap-1 mt-1">
          <svg className="h-4 w-4 ml-auto" viewBox="0 0 168 168" style={{ marginTop: '0.1rem' }}>
            <path
              fill="#1ED760"
              d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l.001-.004zm38.404 120.78a5.217 5.217 0 01-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 01-6.249-3.93 5.213 5.213 0 013.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35a6.538 6.538 0 014.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-.001zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 015.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 012.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z"
            ></path>
          </svg>
          <div className="flex flex-col w-full max-w-full">
            {loading ? (
              <p className="text-gray-800 dark:text-gray-200 font-medium whitespace-pre-line">
                {localesData.load}
              </p>
            ) : (
              <>
                {error ? (
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{localesData.err}</p>
                ) : (
                  <>
                    {data.playing ? (
                      <Link
                        href={data.data.url}
                        className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                        locale={currentLocale}
                      >
                        {data.data.artist.join(', ')} – {data.data.title}
                      </Link>
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {localesData.stop}
                      </p>
                    )}
                  </>
                )}
              </>
            )}
            {!loading && !error && data.playing && (
              <div className="flex flex-col mt-0.5">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  <TimerLoader
                    current={data.data.progress / 1000}
                    total={data.data.duration / 1000}
                    onFinished={() =>
                      setTimeout(() => {
                        this.refreshData()
                          .then(() => {
                            return;
                          })
                          .catch(() => {
                            return;
                          });
                      }, 2000)
                    }
                  />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

interface PostLayoutProps {
  children?: React.ReactNode;
  frontMatter: FrontMatterData;
  next?: FrontMatterData;
  prev?: FrontMatterData;
}

export default function PostLayout({ children, frontMatter, next, prev }: PostLayoutProps) {
  const { slug, fileName, date, title, tags, readingTime, images } = frontMatter;
  const intl = useIntl();

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
    spotifyListening2: {
      id: 'spotifyListening2',
    },
    spotifyNotPlaying: {
      id: 'spotifyNotPlaying',
    },
    spotifyAlbumBy: {
      id: 'spotifyAlbumBy',
    },
    spotifyLoadingData: {
      id: 'spotifyLoadingData',
    },
    spotifyLoadError: {
      id: 'spotifyLoadError',
    },
  };

  let selectedImages;
  if (Array.isArray(images) && images.length > 0) {
    selectedImages = images[0];
  }

  const rtmMin = readingTime.minutes;
  let readingTimeText = Math.ceil(rtmMin).toString();
  if (rtmMin < 1) {
    readingTimeText = intl.formatMessage(descriptors.readingTimeLessThan);
  }

  const readTimeText = intl.formatMessage(descriptors.readingTime, {
    minutes: readingTimeText,
  });

  const spotifyDataLocales = {
    play: intl.formatMessage(descriptors.spotifyListening2),
    stop: intl.formatMessage(descriptors.spotifyNotPlaying),
    by: intl.formatMessage(descriptors.spotifyAlbumBy),
    load: intl.formatMessage(descriptors.spotifyLoadingData),
    err: intl.formatMessage(descriptors.spotifyLoadError),
  };

  return (
    <>
      <SectionContainer>
        <BlogSeo url={`/posts/${frontMatter.slug}`} {...frontMatter} />
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
                        {typeof siteMetadata.twitter === 'string' && (
                          <>
                            <dt className="sr-only">Twitter</dt>
                            <dd>
                              <Link
                                href={siteMetadata.twitter}
                                className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                                locale={intl.locale}
                              >
                                {siteMetadata.twitter.replace('https://twitter.com/', '@')}
                              </Link>
                            </dd>
                          </>
                        )}
                      </dl>
                    </li>
                  </ul>
                </dd>
              </dl>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:pb-0 xl:col-span-3 xl:row-span-2">
                <div className="pt-10 pb-8 prose dark:prose-dark max-w-none">
                  {selectedImages && (
                    <div className="prose dark:prose-dark flex flex-col mx-auto">
                      <img className="w-full" src={selectedImages} alt="Featured Images" />
                    </div>
                  )}
                  {children}
                </div>
                <div className="pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
                  <Link href={editUrl(fileName, intl.locale)} locale={intl.locale}>
                    View on GitHub
                  </Link>
                </div>
                <div className="pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
                  <Comments slug={slug} />
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
                  <SpotifyNow localesData={spotifyDataLocales} currentLocale={intl.locale} />
                  <>
                    {(next || prev) && (
                      <div className="flex justify-between py-4 xl:block xl:py-8 xl:space-y-8">
                        {prev && (
                          <div>
                            <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                              {intl.formatMessage(descriptors.prev)}
                            </h2>
                            <div className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                              <Link href={`/posts/${prev.slug}`} locale={intl.locale}>
                                {prev.title}
                              </Link>
                            </div>
                          </div>
                        )}
                        {next && (
                          <div>
                            <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                              {intl.formatMessage(descriptors.next)}
                            </h2>
                            <div className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                              <Link href={`/posts/${next.slug}`} locale={intl.locale}>
                                {next.title}
                              </Link>
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
                      locale={intl.locale}
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
  );
}
