import { getMDXComponent } from 'mdx-bundler/client'
import { useMemo } from 'react'
import CustomLink from './Link'
import Pre from './Pre'

import ShortCode from './shortcode'

const MDXComponents = {
  a: CustomLink,
  pre: Pre,
  ...ShortCode,
}

interface LayoutRender {
  mdxSource: string
}

export default function MDXLayoutRenderer(props: LayoutRender) {
  const MDXComponent = useMemo(() => getMDXComponent(props.mdxSource), [props.mdxSource])

  // @ts-ignore
  return <MDXComponent components={MDXComponents} />
}
