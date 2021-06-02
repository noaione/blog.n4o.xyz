import fs from 'fs'
import hydrate from 'next-mdx-remote/hydrate'
import { getFiles, getFileBySlug, getAllFilesFrontMatter, formatSlug } from '@/lib/mdx'
import PostLayout from '@/layouts/PostLayout'
import MDXComponents from '@/components/MDXComponents'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export async function getStaticPaths({ locales, defaultLocale }) {
  const posts = await getFiles('blog', '*', locales, defaultLocale)
  const allPaths = posts.map((p) => ({
    params: {
      slug: formatSlug(p.slug),
    },
    locale: p.locale,
  }))

  return {
    paths: allPaths,
    fallback: false,
  }
}

export async function getStaticProps({ params, locale, locales, defaultLocale }) {
  const allPosts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale)
  const postIndex = allPosts.findIndex((post) => post.slug === params.slug)
  if (postIndex < 0) {
    return {
      notFound: true,
    }
  }
  const prev = allPosts[postIndex + 1] || null
  const next = allPosts[postIndex - 1] || null
  const post = await getFileBySlug('blog', allPosts[postIndex], locales, defaultLocale)

  const useLocale = locale === defaultLocale ? '' : locale

  // rss
  const rss = generateRss(
    allPosts,
    `${useLocale}${useLocale && '/'}index.xml`,
    locale,
    defaultLocale
  )
  await fs.promises.mkdir(`./public/${useLocale}`, { recursive: true })
  await fs.promises.writeFile(`./public/${useLocale}${useLocale && '/'}index.xml`, rss)

  return { props: { post, prev, next } }
}

export default function Blog({ post, prev, next }) {
  const [reportedView, setReported] = useState(false)
  const router = useRouter()
  const { mdxSource, frontMatter } = post
  const content = hydrate(mdxSource, {
    components: MDXComponents,
  })
  let fullSlug = router.asPath
  if (typeof router.locale === 'string' && router.locale !== router.defaultLocale) {
    fullSlug = `/${router.locale}${fullSlug}`
  }
  fullSlug += '/'

  useEffect(() => {
    if (reportedView) {
      return
    }
    async function postHits() {
      const resp = await fetch('/api/1up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: fullSlug }),
      })
    }
    postHits()
      .then(() => {
        setReported(true)
      })
      .catch(() => {
        setReported(true)
      })
  }, [reportedView])

  return (
    <>
      {frontMatter.draft !== true ? (
        <PostLayout frontMatter={frontMatter} prev={prev} next={next}>
          {content}
        </PostLayout>
      ) : (
        <div className="mt-24 text-center">
          <PageTitle>
            Under Construction{' '}
            <span role="img" aria-label="roadwork sign">
              🚧
            </span>
          </PageTitle>
        </div>
      )}
    </>
  )
}
