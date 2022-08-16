/* eslint-disable @next/next/no-img-element */
import Link from '@/components/Link';
import { PageSeo } from '@/components/SEO';
import Tag from '@/components/Tag';
import SpotifyNowPlaying from '@/components/SpotifyNowPlaying';
import LiteralClubEmbed from '@/components/Literal';
import siteMetadata from '@/data/siteMetadata.json';

import { unified } from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';

import React from 'react';
import { useIntl } from 'react-intl';
import { GetStaticPropsContext } from 'next';
import LiteralIcon from '@/components/Literal/Icon';

const postDateTemplate: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export async function getStaticProps({ locale, locales, defaultLocale }: GetStaticPropsContext) {
  const { getAllFilesFrontMatter } = await import('@/lib/mdx');
  const posts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale);

  return { props: { posts } };
}

function summaryFormatter(textData: string) {
  if (textData.replace(/\s/g, '') === '') {
    return '';
  }
  const result = unified().use(markdown).use(html).processSync(textData);
  return result.toString();
}

export default function Home({ posts }) {
  const intl = useIntl();

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
    latestDesc: {
      id: 'descHomePage',
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
    literalReading: {
      id: 'literalReading',
    },
    literalNoBooks: {
      id: 'literalNoBooks',
    },
    literalOutgoing: {
      id: 'literalOutgoing',
    },
  };

  const spotifyDataLocales = {
    play: intl.formatMessage(descriptors.spotifyListening),
    stop: intl.formatMessage(descriptors.spotifyNotPlaying),
    by: intl.formatMessage(descriptors.spotifyAlbumBy),
  };

  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'home' })}
        description={intl.formatMessage(descriptors.siteDesc)}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {intl.formatMessage(descriptors.latest)}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {intl.formatMessage(descriptors.latestDesc, { author: siteMetadata.author })}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && <p className="mt-2">{intl.formatMessage(descriptors.noArticle)}</p>}
          {posts.slice(0, 1).map((frontMatter) => {
            const { slug, date, title, summary, tags, images, draft } = frontMatter;
            let selectedImages;
            if (Array.isArray(images) && images.length > 0) {
              selectedImages = images[0];
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
                              className="text-gray-900 dark:text-gray-100 hover:underline"
                              locale={intl.locale}
                            >
                              {draft && (
                                <>
                                  <span>
                                    {'('}
                                    <span role="img" aria-label="construction sign">
                                      🚧
                                    </span>
                                    {' Draft) '}
                                  </span>
                                </>
                              )}
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
                          locale={intl.locale}
                        >
                          {intl.formatMessage(descriptors.readMore)} &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
      {posts.length > 1 && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/posts"
            className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label={intl.formatMessage(descriptors.readMore).toLowerCase()}
            locale={intl.locale}
          >
            {intl.formatMessage(descriptors.allPosts)} &rarr;
          </Link>
        </div>
      )}
      <SpotifyNowPlaying currentLocale={intl.locale} localesData={spotifyDataLocales} />
      <div className="flex flex-col w-full mt-6" style={{ paddingTop: '1rem' }}>
        <h2 className="text-xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-4xl md:leading-14 mb-1">
          {intl.formatMessage(descriptors.literalReading)}
        </h2>
        <div className="flex flex-row align-middle" style={{ paddingBottom: '1rem' }}>
          <LiteralIcon className="h-5 w-5 mr-1 select-none" />
          <p className="mr-1">{intl.formatMessage(descriptors.literalOutgoing)}</p>
          <a
            href="https://literal.club/noaione"
            className="text-blue-500 hover:text-blue-600 hover:underline transition"
          >
            Literal.club
          </a>
        </div>
        <LiteralClubEmbed handle="noaione" readingState="IS_READING" />
      </div>
    </>
  );
}
