import Document, { Html, Head, Main, NextScript } from 'next/document';

import LocaleData from '../locale-data';
import { InlineJs } from '@kachkaev/react-inline-js';

const THEME_CHECKER_JS = `
// Helper
const isNullified = function(data) {
    return typeof data === "undefined" || data === null;
}

// Ignore this page
const isEmbedPage = location.pathname === "/embed";

// Check for first user preferences.
let userPreferDark;
let systemPreferDark = false;
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    systemPreferDark = true;
}
try {
    const themeStorage = localStorage.getItem("theme");
    if (!isNullified(themeStorage)) {
        userPreferDark = themeStorage === "dark" ? true : false;
    }
} catch (e) {};
if (isNullified(userPreferDark)) {
    if (systemPreferDark) {
        if (!isEmbedPage) document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
} else {
    if (userPreferDark && !isEmbedPage) {
        document.documentElement.classList.add("dark");
    }
}
`;

class BlogDocumentSection extends Document {
  constructor(props) {
    super(props);
  }

  render() {
    const { locale } = this.props;
    let useLocale = '/' + locale;
    if (locale === LocaleData.defaultLocale) {
      useLocale = '';
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
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css"
            integrity="sha384-Um5gpz1odJg5Z4HAmzPtgZKdTBHZdw8S29IecapCSB31ligYPhHQZMIlWLYQGVoc"
            crossOrigin="anonymous"
          />
          <script defer async data-domain="blog.n4o.xyz" src="/js/kryptonite.js" />
          <InlineJs code={THEME_CHECKER_JS} />
        </Head>
        <body className="antialiased text-black bg-white dark:bg-gray-900 dark:text-white transition-colors duration-200 ease-in-out">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default BlogDocumentSection;
