import React from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'

import { DiscussionEmbed } from 'disqus-react'
import { useTheme } from 'next-themes'

import siteMetadata from '@/data/siteMetadata'

function generateURLFromSlug(slug, locale, defaultLocale) {
  const baseURL = siteMetadata.siteUrl
  let extraUrl = `/${locale}/posts/${slug}`
  if (locale === defaultLocale) {
    extraUrl = `/posts/${slug}`
  }
  return baseURL + extraUrl
}

function generateIdentifier(slug, locale, defaultLocale) {
  if (locale === defaultLocale) {
    return slug
  }
  return slug + `-${locale}`
}

function DisqusComments(props) {
  const { slug, title } = props
  const router = useRouter()
  const { theme } = useTheme()

  const locale = router.locale
  const defaultLocale = router.defaultLocale
  const fullURL = generateURLFromSlug(slug, locale, defaultLocale)

  const disqusConfig = {
    url: fullURL,
    identifier: generateIdentifier(slug, locale, defaultLocale),
    title: title,
    language: locale || defaultLocale || 'en',
  }

  return (
    <div className="disqus-wrapper">
      <div id="comments">
        <DiscussionEmbed shortname="catatann4o" config={disqusConfig} theme={theme} />
      </div>
    </div>
  )
}

DisqusComments.propTypes = {
  title: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
}

export default DisqusComments
