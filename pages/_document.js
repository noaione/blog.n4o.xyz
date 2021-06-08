import Document, { Html, Head, Main, NextScript } from 'next/document'
import { useRouter } from 'next/router'

class MyDocument extends Document {
  constructor(props) {
    super(props)
  }

  render() {
    const { locale, defaultLocale } = this.props
    let useLocale = '/' + locale
    if (locale === defaultLocale) {
      useLocale = ''
    }
    return (
      <Html lang={locale || 'en'} prefix="og: https://ogp.me/ns#">
        <Head>
          <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/apple-touch-icon.png" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/static/favicons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/static/favicons/favicon-16x16.png"
          />
          <link rel="manifest" href="/static/favicons/site.webmanifest" />
          <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg" color="#F08257" />
          <meta name="msapplication-TileColor" content="#F08257" />
          <meta name="theme-color" content="#F08257" />
          <link rel="alternate" type="application/rss+xml" href={`${useLocale}/index.xml`} />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
          <link
            rel="preload"
            href="https://cdn.jsdelivr.net/npm/katex@0.13.0/dist/fonts/KaTeX_Main-Regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="https://cdn.jsdelivr.net/npm/katex@0.13.0/dist/fonts/KaTeX_Math-Italic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="https://cdn.jsdelivr.net/npm/katex@0.13.0/dist/fonts/KaTeX_Size2-Regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="https://cdn.jsdelivr.net/npm/katex@0.13.0/dist/fonts/KaTeX_Size4-Regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex@0.13.0/dist/katex.min.css"
            integrity="sha384-t5CR+zwDAROtph0PXGte6ia8heboACF9R5l/DiY+WZ3P2lxNgvJkQk5n7GPvLMYw"
            crossOrigin="anonymous"
          />
          <script
            defer
            async
            data-domain="blog.n4o.xyz"
            data-api="/api/kryptonite"
            src="/js/kryptonite.js"
          />
        </Head>
        <body className="antialiased text-black bg-white dark:bg-gray-900 dark:text-white transition-colors duration-200 ease-in-out">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

function WrapDocument(props) {
  const route = useRouter()
  return <MyDocument locale={route.locale} defaultLocale={route.defaultLocale} {...props} />
}

export default MyDocument
