import Image from 'next/image'
import CustomLink from './Link'

import ShortCode from './shortcode'

const MDXComponents = {
  Image,
  a: CustomLink,
  ...ShortCode,
}

export default MDXComponents
