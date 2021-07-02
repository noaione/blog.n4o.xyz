import { getMDXComponent } from 'mdx-bundler/client'
import { useMemo } from 'react'
import CustomLink from './Link'
import Pre from './Pre'

import ShortCode from './shortcode'

const MDXComponents = {
  a: CustomLink,
  pre: Pre,
  Link: CustomLink,
  ...ShortCode,
}

interface LayoutRender {
  mdxSource: string
}

export default function MDXLayoutRenderer({ mdxSource }: LayoutRender) {
  const CompiledMDX = useMemo(() => getMDXComponent(mdxSource), [mdxSource])

  // @ts-ignore
  return <CompiledMDX components={MDXComponents} />
}
