import Link from '@/components/Link'
import Tag from '@/components/Tag'
import Pagination from '@/components/Pagination'
import siteMetadata from '@/data/siteMetadata'

import remark from 'remark'
import markdown from 'remark-parse'
import html from 'remark-html'
import disemote from '@/lib/disemote'

import { useState } from 'react'
import { useIntl } from 'react-intl'

const postDateTemplate = { year: 'numeric', month: 'long', day: 'numeric' }

function summaryFormatter(textData) {
  if (textData.replace(/\s/g) === '') {
    return ''
  }
  const result = remark().use(markdown).use(disemote).use(html).processSync(textData)
  return result.toString()
}

export default function ListLayout({
  posts,
  title,
  pagination,
  initialDisplayPosts = [],
  isPosts,
}) {
  const [searchValue, setSearchValue] = useState('')
  const intl = useIntl()
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.summary + frontMatter.tags.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  const descriptors = {
    searchArticle: {
      id: 'searchArticle',
      description: undefined,
      defaultMessage: undefined,
    },
    searchNoResult: {
      id: 'searchNoResult',
      description: undefined,
      defaultMessage: undefined,
    },
    noArticle: {
      id: 'noArticle',
      description: undefined,
      defaultMessage: undefined,
    },
    tags: {
      id: 'tags',
      description: undefined,
      defaultMessage: undefined,
    },
  }

  let usedNoData = descriptors.noArticle
  if (searchValue !== '') {
    usedNoData = descriptors.searchNoResult
  }

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <>
      <div className="divide-y">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          {!isPosts && (
            <p className="text-lg uppercase leading-3 tracking-wider text-gray-600 dark:text-gray-400 font-bold">
              {intl.formatMessage(descriptors.tags)}
            </p>
          )}
          <h1
            className={`text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 ${
              isPosts ? '' : 'lowercase'
            }`}
          >
            {isPosts ? title : `#${title}`}
          </h1>
          <div className="relative max-w-lg">
            <input
              aria-label={intl.formatMessage(descriptors.searchArticle)}
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={intl.formatMessage(descriptors.searchArticle)}
              className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-md dark:border-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
            />
            <svg
              className="absolute w-5 h-5 text-gray-400 right-3 top-3 dark:text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <ul>
          {!filteredBlogPosts.length && <p className="mt-2">{intl.formatMessage(usedNoData)}</p>}
          {displayPosts.map((frontMatter) => {
            const { slug, date, title, summary, tags, images } = frontMatter
            let selectedImages
            if (Array.isArray(images) && images.length > 0) {
              selectedImages = images[0]
            }
            return (
              <li key={slug} className="py-4">
                <article className="space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline">
                  <dl style={{ alignSelf: 'flex-start' }}>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>
                        {new Date(date).toLocaleDateString(intl.locale, postDateTemplate)}
                      </time>
                    </dd>
                  </dl>
                  <div className="space-y-3 xl:col-span-3">
                    <div>
                      <h3 className="text-2xl font-bold leading-8 tracking-tight">
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
                        >
                          {title}
                        </Link>
                      </h3>
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
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          isPosts={isPosts}
        />
      )}
    </>
  )
}
