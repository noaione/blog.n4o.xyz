import { MDXRemote } from 'next-mdx-remote/index'
import PostLayout from '@/layouts/PostLayout'
import MDXComponents from '@/components/MDXComponents'
import PageTitle from '@/components/PageTitle'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export async function getStaticPaths({ locales, defaultLocale }) {
  const { getFiles, formatSlug } = await import('@/lib/mdx')
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
  const { getFileBySlug, getAllFilesFrontMatter } = await import('@/lib/mdx')
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

  return { props: { post, prev, next } }
}

export default function Blog({ post, prev, next }) {
  const [reportedView, setReported] = useState(false)
  const router = useRouter()
  const { mdxSource, frontMatter } = post
  let fullSlug = router.asPath
  if (typeof router.locale === 'string' && router.locale !== router.defaultLocale) {
    fullSlug = `/${router.locale}${fullSlug}`
  }
  fullSlug += '/'

  async function postHits() {
    const resp = await fetch('/api/1up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slug: fullSlug }),
    })
  }

  useEffect(() => {
    if (reportedView) {
      return
    }

    postHits()
      .then(() => {
        setReported(true)
      })
      .catch(() => {
        setReported(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {frontMatter.draft !== true ? (
        <PostLayout frontMatter={frontMatter} prev={prev} next={next}>
          <MDXRemote {...mdxSource} components={MDXComponents} />
        </PostLayout>
      ) : (
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <div className="text-center" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <PageTitle>
              Under Construction{' '}
              <span role="img" aria-label="roadwork sign">
                🚧
              </span>
            </PageTitle>
            <p className="text-gray-400 mt-2">This post is still under writing</p>
          </div>
          <PostLayout frontMatter={frontMatter} prev={prev} next={next}>
            <MDXRemote {...mdxSource} components={MDXComponents} />
          </PostLayout>
        </div>
      )}
    </>
  )
}
