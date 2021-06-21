/* eslint-disable jsx-a11y/anchor-has-content */
import Link from 'next/link'

function isS(s) {
  return typeof s === 'string' && s.length > 0
}

const CustomLink = ({ href, locale, ...rest }) => {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')
  const { className, ...realRest } = rest

  if (isInternalLink) {
    return (
      <Link href={href} locale={locale} passHref>
        <a className={`break-words ${isS(className) ? className : ''}`} {...realRest} />
      </Link>
    )
  }

  if (isAnchorLink) {
    return (
      <a href={href} className={`break-words ${isS(className) ? className : ''}`} {...realRest} />
    )
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      className={`break-words ${isS(className) ? className : ''}`}
      {...realRest}
    />
  )
}

export default CustomLink
