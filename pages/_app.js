import '@/css/tailwind.css'

import { MDXProvider } from '@mdx-js/react'
import { ThemeProvider } from 'next-themes'
import { DefaultSeo } from 'next-seo'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { IntlProvider } from 'react-intl'

import { SEO } from '@/components/SEO'
import LayoutWrapper from '@/components/LayoutWrapper'
import MDXComponents from '@/components/MDXComponents'

import LocaleEn from '@/locale/en'
import LocaleId from '@/locale/id'

const languages = {
  id: LocaleId,
  en: LocaleEn,
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const { locale, defaultLocale } = router
  const messages = languages[locale]

  return (
    <IntlProvider messages={messages} locale={locale} defaultFormats={defaultLocale}>
      <ThemeProvider attribute="class">
        <MDXProvider components={MDXComponents}>
          <Head>
            <meta content="width=device-width, initial-scale=1" name="viewport" />
          </Head>
          <DefaultSeo {...SEO} />
          <LayoutWrapper>
            <Component {...pageProps} />
          </LayoutWrapper>
        </MDXProvider>
      </ThemeProvider>
    </IntlProvider>
  )
}
