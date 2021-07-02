/* eslint-disable jsx-a11y/anchor-has-content */
import Link from 'next/link'
import { AnchorHTMLAttributes, DetailedHTMLProps } from 'react'

function isS(s: string): s is string {
  return typeof s === 'string' && s.length > 0
}

interface CustomLinkProps
  extends DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  locale: string
}

const CustomLink = ({ href, locale, ...rest }: CustomLinkProps) => {
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
