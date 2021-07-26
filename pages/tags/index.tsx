import { kebabCase } from '@/lib/utils'
import { TagCount } from '@/lib/tags'
import Tag from '@/components/Tag'
import Link from '@/components/Link'
import { PageSeo } from '@/components/SEO'

import { FormattedMessage, useIntl } from 'react-intl'
import { GetStaticPropsContext } from 'next'

type TagDatas = { [key: string]: TagCount }

export async function getStaticProps({ locale, locales, defaultLocale }: GetStaticPropsContext) {
  const { getAllTags } = await import('@/lib/tags')
  const tags = await getAllTags('blog', locale, locales, defaultLocale)

  return { props: { tags } }
}

export default function Tags({ tags }: { tags: TagDatas }) {
  const sortedTags = Object.keys(tags).sort((a, b) => tags[b].count - tags[a].count)
  const intl = useIntl()

  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'tags' })}
        description={intl.formatMessage({ id: 'descTagsPage' })}
      />
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 dark:divide-gray-700 md:justify-center md:items-center md:divide-y-0 md:flex-row md:space-x-6 md:mt-24">
        <div className="pt-6 pb-8 space-x-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 md:border-r-2 md:px-6">
            <FormattedMessage id="tags" />
          </h1>
        </div>
        <div className="flex flex-wrap max-w-lg">
          {Object.keys(tags).length === 0 && intl.formatMessage({ id: 'noTags' })}
          {sortedTags.map((t) => {
            return (
              <div key={t} className="mt-2 mb-2 mr-5">
                <Tag text={t} />
                <Link
                  href={`/tags/${kebabCase(t)}`}
                  className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
                  locale={intl.locale}
                >
                  {` (${tags[t]['count']})`}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
