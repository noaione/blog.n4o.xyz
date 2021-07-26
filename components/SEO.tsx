import { NextSeo, ArticleJsonLd } from 'next-seo'
import siteMetadata from '@/data/siteMetadata.json'
import { useRouter } from 'next/router'
import Head from 'next/head'

export const SEO = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  openGraph: {
    type: 'website',
    locale: siteMetadata.language,
    url: siteMetadata.siteUrl,
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [
      {
        url: `${siteMetadata.siteUrl}${siteMetadata.socialBanner}`,
        alt: siteMetadata.title,
        width: 1200,
        height: 600,
      },
    ],
  },
  twitter: {
    handle: siteMetadata.twitter,
    site: siteMetadata.twitter,
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'author',
      content: siteMetadata.author,
    },
  ],
}

interface PageSEOProps {
  title: string
  description: string
}

export function PageSeo({ title, description }: PageSEOProps) {
  const router = useRouter()

  return (
    <Head>
      <title>{`${title}`}</title>
      <meta name="robots" content="follow, index" />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${siteMetadata.siteUrl}${router.asPath}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteMetadata.title} />
      <meta property="og:image" content={`${siteMetadata.siteUrl}${siteMetadata.socialBanner}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteMetadata.twitter} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteMetadata.siteUrl}${siteMetadata.socialBanner}`} />
    </Head>
  )
}

interface IReadTimeResults {
  text: string
  time: number
  words: number
  minutes: number
}

export interface FrontMatterData {
  slug: string
  summary: string
  fileName: string
  date: string
  url?: string
  lastmod?: string
  title: string
  tags?: string[]
  readingTime: IReadTimeResults
  images?: string[]
  locale?: string
  draft?: boolean
}

export const BlogSeo = ({
  title,
  summary,
  date,
  lastmod,
  url,
  tags,
  images = [],
}: FrontMatterData) => {
  const intl = useRouter()
  const publishedAt = new Date(date).toISOString()
  const modifiedAt = new Date(lastmod || date).toISOString()
  const imagesArr =
    images.length === 0
      ? [siteMetadata.socialBanner]
      : typeof images === 'string'
      ? [images]
      : images

  const featuredImages = imagesArr.map((img) => {
    return {
      url: `${siteMetadata.siteUrl}${img}`,
      alt: title,
    }
  })
  let useLocale = ''
  if (intl.locale !== intl.defaultLocale) {
    url = '/' + intl.locale + url
    useLocale = '/' + intl.locale
  }
  url = siteMetadata.siteUrl + url

  return (
    <>
      <NextSeo
        title={`${title} :: ${siteMetadata.title}`}
        description={summary}
        canonical={url}
        openGraph={{
          type: 'article',
          article: {
            publishedTime: publishedAt,
            modifiedTime: modifiedAt,
            authors: [`${siteMetadata.siteUrl}${useLocale}/about`],
            tags,
          },
          url,
          title,
          locale: intl.locale,
          site_name: siteMetadata.title,
          description: summary,
          images: featuredImages,
        }}
        twitter={{ cardType: 'summary_large_image' }}
        additionalMetaTags={[
          {
            name: 'twitter:image',
            content: featuredImages[0].url,
          },
        ]}
      />
      <ArticleJsonLd
        authorName={siteMetadata.author}
        dateModified={modifiedAt}
        datePublished={publishedAt}
        description={summary}
        images={featuredImages.map((e) => e.url)}
        publisherName={siteMetadata.author}
        publisherLogo={siteMetadata.image}
        title={title}
        url={url}
      />
    </>
  )
}
