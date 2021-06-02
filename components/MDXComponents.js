import CustomLink from './Link'

import ShortCode from './shortcode'

const MDXComponents = {
  a: CustomLink,
  ...ShortCode,
}

export default MDXComponents
