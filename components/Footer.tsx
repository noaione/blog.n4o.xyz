import { useRouter } from 'next/router'

import Link from './Link'

import siteMetadata from '@/data/siteMetadata.json'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  const router = useRouter()
  return (
    <footer>
      <div className="flex flex-col items-center mt-16">
        <div className="flex mb-3 space-x-4">
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={6} />
          <SocialIcon kind="github" href={siteMetadata.github} size={6} />
          <SocialIcon kind="twitter" href={siteMetadata?.twitter} size={6} />
          <SocialIcon kind="trakteer" href={siteMetadata?.trakteer} size={6} />
        </div>
        <div className="flex mb-2 space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{` • `}</div>
          <div>{siteMetadata.author}</div>
        </div>
        <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-1">Designed with</span>
          <Link
            href="https://github.com/timlrx/tailwind-nextjs-starter-blog"
            className="hover:opacity-80 duration-100 hover:underline"
            locale={router.locale}
          >
            a modified Tailwind NextJS Starter Blog
          </Link>
        </div>
      </div>
    </footer>
  )
}
