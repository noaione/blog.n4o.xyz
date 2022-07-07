/* eslint-disable @next/next/no-img-element */
import React from 'react';

import type { SpotifyNowResult } from '@/lib/spotify';
import { isNone } from '@/lib/utils';
import Link from './Link';
import TimerLoader from './TimerLoader';
import SpotifyHubSkeleton from './SpotifyHubSkeleton';
import { DateTime } from 'luxon';

interface SpotifyLocalesString {
  play: string;
  stop: string;
  by: string;
  load?: string;
  err?: string;
}

interface SpotifyRenderProps {
  data?: SpotifyNowResult;
}

interface RenderProps {
  fallback?: React.ReactNode;
  error?: boolean;
  isLoading?: boolean;
  firstTime?: string;
  localesData: SpotifyLocalesString;
  currentLocale: string;
  onFinished: () => void;
}

interface SpotifyNowState extends SpotifyRenderProps {
  loading: boolean;
  firstTime: boolean;
  error: boolean;
}

interface NowPlayingProps {
  localesData: SpotifyLocalesString;
  currentLocale: string;
  compact?: boolean;
}

const noop = () => {
  return;
};

function SpotifyPlayerCompact(props: SpotifyRenderProps & RenderProps) {
  const { data, fallback, error, localesData, isLoading, onFinished, currentLocale } = props;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="flex flex-row items-start gap-1 mt-1">
        <svg className="h-4 w-4 ml-auto" viewBox="0 0 168 168" style={{ marginTop: '0.1rem' }}>
          <path
            fill="#1ED760"
            d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l.001-.004zm38.404 120.78a5.217 5.217 0 01-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 01-6.249-3.93 5.213 5.213 0 013.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35a6.538 6.538 0 014.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-.001zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 015.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 012.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z"
          />
        </svg>
        <div className="flex flex-col w-full max-w-full">{children}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Wrapper>
        <p className="text-gray-800 dark:text-gray-200 font-medium whitespace-pre-line">
          {localesData.load}
        </p>
      </Wrapper>
    );
  }
  if (isNone(data)) {
    if (error) {
      return (
        <Wrapper>
          <p className="text-gray-800 dark:text-gray-200 font-medium">{localesData.err}</p>
        </Wrapper>
      );
    }
    return <Wrapper>{fallback || null}</Wrapper>;
  }

  if (!data.playing) {
    return (
      <Wrapper>
        <p className="text-gray-800 dark:text-gray-200 font-medium">{localesData.stop}</p>;
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Link
        href={data.data.url}
        locale={currentLocale}
        className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
      >
        {data.data.artist.map((r) => r.name).join(', ')} - {data.data.title}
      </Link>
      <div className="flex flex-col mt-0.5">
        <p className="text-gray-800 dark:text-gray-200 font-medium">
          <TimerLoader
            current={data.data.progress / 1000}
            total={data.data.duration / 1000}
            onFinished={() => {
              setTimeout(() => {
                onFinished();
              }, 2000);
            }}
          />
        </p>
      </div>
    </Wrapper>
  );
}

function SpotifyPlayerFull(props: SpotifyRenderProps & RenderProps) {
  const { data, localesData, isLoading, firstTime, currentLocale, onFinished } = props;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex flex-col w-full max-w-full">{children}</div>;
  };

  if (isLoading && firstTime) {
    return (
      <Wrapper>
        <SpotifyHubSkeleton />
      </Wrapper>
    );
  }
  if (isNone(data)) {
    return (
      <Wrapper>
        <SpotifyHubSkeleton />
      </Wrapper>
    );
  }

  if (!data.playing) {
    return (
      <Wrapper>
        <div className="flex flex-row items-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 168 168">
            <path
              fill="#1ED760"
              d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l.001-.004zm38.404 120.78a5.217 5.217 0 01-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 01-6.249-3.93 5.213 5.213 0 013.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35a6.538 6.538 0 014.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-.001zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 015.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 012.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z"
            />
          </svg>
          <h3 className="text-gray-800 dark:text-gray-200 font-medium text-xl">
            {localesData.stop}
          </h3>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="flex flex-col items-center md:flex-row md:items-start gap-4">
        <div className="relative">
          <a href={data.data.album.url} rel="noopener noreferrer" target="_blank">
            <div className="absolute top-0 bottom-0 right-0 left-0 rounded-lg border-4 spotify-wave duration-[10s]" />
            <img
              className="w-96 rounded-lg !shadow-lg"
              src={data.data.album.cover}
              alt={`${data.data.album.name} Album Art`}
            />
          </a>
        </div>
        <div className="flex flex-col text-center md:text-left gap-2">
          <div>
            <Link
              href={data.data.url}
              className="hover:underline text-2xl md:text-3xl lg:text-4xl font-bold"
              locale={currentLocale}
            >
              {data.data.title}
            </Link>
          </div>
          <div className="font-semibold text-gray-600 dark:text-gray-500 text-xl md:text-2xl">
            <span className="mr-1">
              <Link href={data.data.album.url} locale={currentLocale} className="hover:underline">
                {data.data.album.name}
              </Link>
            </span>
            <span className="mr-1">{localesData.by}</span>
            {data.data.artist.map((artist, index) => {
              return (
                <span key={'spartist:' + artist.id}>
                  <Link href={artist.url} locale={currentLocale} className="hover:underline">
                    {artist.name}
                  </Link>
                  {index !== data.data.artist.length - 1 && <span>, </span>}
                </span>
              );
            })}
            {/* {mainData.album.name} {localesData.by} {mainData.artist.join(', ')} */}
          </div>
          <div className="font-light text-gray-400 dark:text-gray-500">
            {DateTime.fromSQL(data.data.album.date)
              .setLocale(currentLocale)
              .toLocaleString(DateTime.DATE_FULL)}
          </div>
          <div className="font-light text-gray-400 dark:text-gray-500">
            <TimerLoader
              current={data.data.progress / 1000}
              total={data.data.duration / 1000}
              onFinished={() =>
                setTimeout(() => {
                  onFinished();
                }, 2000)
              }
            />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

export default class SpotifyNowPlaying extends React.Component<NowPlayingProps, SpotifyNowState> {
  refreshTiming?: NodeJS.Timeout;
  constructor(props: NowPlayingProps) {
    super(props);
    this.refreshData = this.refreshData.bind(this);

    this.state = {
      data: undefined,
      loading: true,
      firstTime: true,
      error: false,
    };
  }

  async componentDidMount() {
    await this.refreshData();

    this.refreshTiming = setInterval(() => {
      const { data, loading } = this.state;
      if (!isNone(data) && !data.playing && !loading) {
        this.refreshData().then(noop).catch(noop);
      }
    }, 30 * 1000);
  }

  componentWillUnmount(): void {
    if (this.refreshTiming) {
      clearInterval(this.refreshTiming);
    }
  }

  async refreshData() {
    this.setState({ loading: true });
    const response = await fetch('/api/now');
    if (response.status !== 200) {
      this.setState({ error: true, loading: false, data: { playing: false } });
      return;
    }
    const data = await response.json();
    this.setState({ data, loading: false });
  }

  render() {
    const { data, loading, error } = this.state;
    const { compact, localesData, currentLocale } = this.props;

    if (compact) {
      return (
        <SpotifyPlayerCompact
          data={data}
          localesData={localesData}
          error={error}
          isLoading={loading}
          currentLocale={currentLocale}
          onFinished={() => {
            this.refreshData().then(noop).catch(noop);
          }}
        />
      );
    }

    const playing = !isNone(data) && data.playing;

    return (
      <div>
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h2 className="text-xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-4xl md:leading-14 mb-1">
            Spotify
          </h2>
          {!loading && playing && (
            <div className="!-mt-0.5 flex flex-row items-center gap-2">
              <img
                className="w-6 h-6"
                src="https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/3x"
                alt="PepeJam"
              />
              <p className="text-gray-400 dark:text-gray-500 tracking-wide">{localesData.play}</p>
            </div>
          )}
        </div>
        <SpotifyPlayerFull
          data={data}
          localesData={localesData}
          error={error}
          isLoading={loading}
          currentLocale={currentLocale}
          onFinished={() => {
            this.refreshData().then(noop).catch(noop);
          }}
        />
      </div>
    );
  }
}
