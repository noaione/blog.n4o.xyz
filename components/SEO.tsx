import { NextSeo, ArticleJsonLd } from 'next-seo'
import siteMetadata from '@/data/siteMetadata.json'
import { useRouter } from 'next/router'

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
  title: string;
  description: string;
  url: string;
}

export const PageSeo = ({ title, description, url }: PageSEOProps) => {
  const intl = useRouter()
  if (intl.locale !== intl.defaultLocale) {
    url = '/' + intl.locale + url
  }
  url = siteMetadata.siteUrl + url

  return (
    <NextSeo
      title={`${title} :: ${siteMetadata.title}`}
      description={description}
      canonical={url}
      openGraph={{
        url,
        title,
        description,
        locale: intl.locale,
        site_name: siteMetadata.title,
      }}
    />
  )
}

interface BlogSeoProps {
  title: string;
  summary: string;
  date: string;
  lastmod: string;
  url: string;
  tags: string[];
  images: string[];
}

export const BlogSeo = ({ title, summary, date, lastmod, url, tags, images = [] }: BlogSeoProps) => {
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
