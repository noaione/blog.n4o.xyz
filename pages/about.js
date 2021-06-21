/* eslint-disable @next/next/no-img-element */
import siteMetadata from '@/data/siteMetadata'
import aboutData from '@/data/aboutData'
import SocialIcon from '@/components/social-icons'
import { PageSeo } from '@/components/SEO'

import { useIntl } from 'react-intl'

import remark from 'remark'
import linebreaks from 'remark-breaks'
import gemoji from 'remark-gemoji'
import markdown from 'remark-parse'
import html from 'remark-html'

function parseMarkdownSimple(inputText) {
  const result = remark().use(gemoji).use(linebreaks).use(markdown).use(html).processSync(inputText)
  return result.toString()
}

function buildAboutPage(selectedIntl) {
  if (Array.isArray(aboutData)) {
    aboutData
  }

  const allKeys = Object.keys(aboutData)
  if (!allKeys.includes(selectedIntl)) {
    return aboutData[allKeys[0]]
  }
  return aboutData[selectedIntl]
}

export default function About() {
  const intl = useIntl()

  const sectionsAbout = buildAboutPage(intl.locale)

  return (
    <>
      <PageSeo
        title={`${intl.formatMessage({ id: 'about' })} - ${siteMetadata.author}`}
        description={intl.formatMessage({ id: 'descAboutPage' }, { author: siteMetadata.author })}
        url={`/about`}
      />
      <div className="divide-y">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {intl.formatMessage({ id: 'about' })}
          </h1>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="flex flex-col items-center pt-8 space-x-2">
            <img src={siteMetadata.image} alt="avatar" className="w-48 h-48 rounded-full" />
            <h3 className="pt-4 pb-2 text-2xl font-bold leading-8 tracking-tight">
              {siteMetadata.author}
            </h3>
            <div className="text-gray-500 dark:text-gray-400 text-center">
              {intl.formatMessage({ id: 'tagLine' })}
            </div>
            <div className="flex pt-6 space-x-3">
              <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} />
              <SocialIcon kind="github" href={siteMetadata.github} />
              <SocialIcon kind="facebook" href={siteMetadata.facebook} />
              <SocialIcon kind="youtube" href={siteMetadata.youtube} />
              <SocialIcon kind="linkedin" href={siteMetadata.linkedin} />
              <SocialIcon kind="twitter" href={siteMetadata.twitter} />
              <SocialIcon kind="trakteer" href={siteMetadata.trakteer} />
            </div>
          </div>
          <div className="pt-8 pb-8 prose dark:prose-dark max-w-none xl:col-span-2">
            <p className="italic text-center">{intl.formatMessage({ id: 'siteDesc' })}</p>
            {sectionsAbout.map((section, ev) => {
              const parsedHTML = parseMarkdownSimple(section)
              return <p key={`sec-${ev}`} dangerouslySetInnerHTML={{ __html: parsedHTML }} />
            })}
          </div>
        </div>
      </div>
    </>
  )
}
