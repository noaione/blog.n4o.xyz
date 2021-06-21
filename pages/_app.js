import '@/css/tailwind.css'

import ProgressBar from '@badrap/bar-of-progress'
import { ThemeProvider } from 'next-themes'
import { DefaultSeo } from 'next-seo'
import Head from 'next/head'
import Router from 'next/router'
import { useRouter } from 'next/router'
import { IntlProvider } from 'react-intl'

import { SEO } from '@/components/SEO'
import LayoutWrapper from '@/components/LayoutWrapper'

import LocaleEn from '@/locale/en'
import LocaleId from '@/locale/id'

const languages = {
  id: LocaleId,
  en: LocaleEn,
}

const progress = new ProgressBar({
  size: 2,
  color: '#F08257',
  className: 'z-50',
  delay: 100,
})

Router.events.on('routeChangeStart', progress.start)
Router.events.on('routeChangeComplete', progress.finish)
Router.events.on('routeChangeError', progress.finish)

export default function App({ Component, pageProps, router }) {
  const { locale, defaultLocale } = router
  const messages = languages[locale]

  return (
    <IntlProvider messages={messages} locale={locale} defaultFormats={defaultLocale}>
      <ThemeProvider attribute="class" storageKey="theme">
        <Head>
          <meta content="width=device-width, initial-scale=1" name="viewport" />
        </Head>
        <DefaultSeo {...SEO} />
        <LayoutWrapper>
          <Component {...pageProps} />
        </LayoutWrapper>
      </ThemeProvider>
    </IntlProvider>
  )
}
