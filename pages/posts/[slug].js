import fs from 'fs'
import hydrate from 'next-mdx-remote/hydrate'
import { getFiles, getFileBySlug, getAllFilesFrontMatter, formatSlug } from '@/lib/mdx'
import PostLayout from '@/layouts/PostLayout'
import MDXComponents from '@/components/MDXComponents'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'

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

  // rss
  const rss = generateRss(allPosts)
  fs.writeFileSync('./public/index.xml', rss)

  return { props: { post, prev, next } }
}

export default function Blog({ post, prev, next }) {
  const { mdxSource, frontMatter } = post
  const content = hydrate(mdxSource, {
    components: MDXComponents,
  })

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
