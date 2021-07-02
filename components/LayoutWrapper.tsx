import siteMetadata from '@/data/siteMetadata.json'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import LangSwitch from './LangSwitch'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'

import { useIntl } from 'react-intl'

const LayoutWrapper = ({ children }) => {
  const intl = useIntl()
  return (
    <SectionContainer>
      <div className="flex flex-col justify-between h-screen">
        <header className="flex items-center justify-between py-10">
          <div>
            <Link href="/" aria-label="Blog Home" locale={intl.locale}>
              <div className="flex items-center justify-between hover:underline">
                {typeof siteMetadata.headerTitle === 'string' ? (
                  <div className="hidden h-6 text-2xl font-bold sm:block">
                    {siteMetadata.headerTitle}
                  </div>
                ) : (
                  siteMetadata.headerTitle
                )}
              </div>
            </Link>
          </div>
          <div className="flex items-center text-base leading-5">
            <div className="hidden sm:block">
              {headerNavLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  locale={intl.locale}
                  className="p-1 font-medium text-gray-900 sm:p-4 dark:text-gray-100 hover:opacity-80 transition-opacity duration-150"
                >
                  {intl.formatMessage({ id: link.title.toLowerCase(), defaultMessage: link.title })}
                </Link>
              ))}
            </div>
            <LangSwitch />
            <ThemeSwitch />
            <MobileNav />
          </div>
        </header>
        <main className="mb-auto">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
