import Image from 'next/image'
import siteMetadata from '@/data/siteMetadata'
import projectsData from '@/data/projectsData'
import Link from '@/components/Link'
import Card from '@/components/Card'
import { PageSeo } from '@/components/SEO'

import { FormattedMessage, useIntl } from 'react-intl'

function selectDescription(description, locale) {
  if (typeof description === 'string') {
    return description
  }
  const allKeys = Object.keys(description)
  if (!allKeys.includes(locale)) {
    return description[allKeys[0]]
  }
  return description[locale]
}

export default function Projects() {
  const intl = useIntl()

  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'projects' })}
        description={siteMetadata.description}
        url={`${siteMetadata.siteUrl}/projects`}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            <FormattedMessage id="projects" />
          </h1>
        </div>
        <div className="container py-12">
          <div className="flex flex-wrap -m-4">
            {projectsData.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={selectDescription(d.description, intl.locale)}
                imgSrc={d.imgSrc}
                href={d.href}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
