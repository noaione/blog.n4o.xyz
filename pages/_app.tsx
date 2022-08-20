import 'preact/debug';
import '../css/tailwind.css';
import 'asciinema-player/dist/bundle/asciinema-player.css';
import 'react-multi-carousel/lib/styles.css';
import 'react-medium-image-zoom/dist/styles.css';

import ProgressBar from '@badrap/bar-of-progress';
import ReadingBar from '@/components/ReadingBar';
import Head from 'next/head';
import Router from 'next/router';
import { IntlProvider } from 'react-intl';

import LayoutWrapper from '@/components/LayoutWrapper';

import LocaleEn from '@/locale/en.json';
import LocaleId from '@/locale/id.json';
import { mapBoolean } from '@/lib/utils';

const languages = {
  id: LocaleId,
  en: LocaleEn,
};

const progress = new ProgressBar({
  size: 2,
  color: '#F08257',
  className: 'z-50',
  delay: 100,
});

Router.events.on('routeChangeStart', progress.start);
Router.events.on('routeChangeComplete', progress.finish);
Router.events.on('routeChangeError', progress.finish);

export default function BlogApp({ Component, pageProps, router }) {
  const { locale, defaultLocale } = router;
  const messages = languages[locale];
  const enableReadingBar = mapBoolean(pageProps.enableReadingBar);

  return (
    <IntlProvider messages={messages} locale={locale} defaultFormats={defaultLocale}>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      {enableReadingBar && <ReadingBar />}
      <LayoutWrapper>
        <Component {...pageProps} />
      </LayoutWrapper>
    </IntlProvider>
  );
}
