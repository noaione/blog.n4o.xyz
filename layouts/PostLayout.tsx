/* eslint-disable @next/next/no-img-element */
import Comments from '@/components/Comments';
import Link from '@/components/Link';
import PageTitle from '@/components/PageTitle';
import SectionContainer from '@/components/SectionContainer';
import { BlogSeo, FrontMatterData } from '@/components/SEO';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata.json';
import React, { useEffect, useState } from 'react';

import EyeIcon from '@heroicons/react/solid/EyeIcon';

import { useIntl } from 'react-intl';
import { NextRouter, useRouter } from 'next/router';
import SpotifyNowPlaying from '@/components/SpotifyNowPlaying';

const editUrl = (fileName: string, locale = 'en') =>
  `${siteMetadata.siteRepo}/blob/master/data/blog/${locale}/${fileName}`;

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

interface PostLayoutProps {
  children?: React.ReactNode;
  frontMatter: FrontMatterData;
  next?: FrontMatterData;
  prev?: FrontMatterData;
}

export default function PostLayout({ children, frontMatter, next, prev }: PostLayoutProps) {
  const { slug, fileName, date, title, tags, readingTime, images } = frontMatter;
  const intl = useIntl();
  const [viewState, setViewState] = useState<number>(0);
  const router = useRouter();

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

  const viewCountText = intl.formatMessage(
    { id: 'viewCount' },
    {
      count: viewState.toLocaleString(),
    }
  );

  const spotifyDataLocales = {
    play: intl.formatMessage(descriptors.spotifyListening2),
    stop: intl.formatMessage(descriptors.spotifyNotPlaying),
    by: intl.formatMessage(descriptors.spotifyAlbumBy),
    load: intl.formatMessage(descriptors.spotifyLoadingData),
    err: intl.formatMessage(descriptors.spotifyLoadError),
  };

  async function requestHits(route: NextRouter): Promise<{ hits: number }> {
    const { asPath, defaultLocale, locale } = route;
    let slug = asPath;
    if (defaultLocale !== locale) {
      slug = `/${locale}${slug}`;
    }
    const url = new URLSearchParams();
    url.append('slug', slug);
    console.info(`[PageHit] ${slug}`);
    let response: Response = null;
    try {
      response = await fetch(`/api/hits?${url.toString()}`);
      console.info(`[PageHit] ${slug} ${response.status}`);
    } catch (e) {
      console.error(`[PageHit] ${slug} Unable to get hits!`, e);
      return { hits: 0 };
    }
    try {
      if (response === null) {
        return { hits: 0 };
      }
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (e) {
      console.error(`[PageHit] ${slug} Unable to parse hits!`, e);
      return { hits: 0 };
    }
  }

  useEffect(() => {
    requestHits(router)
      .then((hits) => {
        setViewState(hits.hits ?? 0);
      })
      .catch((a) => {
        console.error(a);
        setViewState(0);
      });
  }, [router]);

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
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    <span>{readTimeText}</span>
                    <span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}>|</span>
                    <EyeIcon className="w-4 h-4 mr-1 inline-block" aria-label="View Count" />
                    <span>{viewCountText}</span>
                  </p>
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
                <div className="pt-10 pb-8 prose dark:prose-invert dark:prose-dark max-w-none">
                  {selectedImages && (
                    <div className="prose dark:prose-invert dark:prose-dark flex flex-col mx-auto">
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
                  <div className="py-4 xl:py-8">
                    <h2 className="text-s tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      {spotifyDataLocales.play}
                    </h2>
                    <SpotifyNowPlaying
                      localesData={spotifyDataLocales}
                      currentLocale={intl.locale}
                      compact
                    />
                  </div>
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
