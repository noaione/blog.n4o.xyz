import CustomLink from './Link'
import Pre from './Pre'

import ShortCode from './shortcode'

const MDXComponents = {
  a: CustomLink,
  pre: Pre,
  ...ShortCode,
}

export default MDXComponents
