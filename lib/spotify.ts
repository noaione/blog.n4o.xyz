import { URLSearchParams } from 'url';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

interface _ExternalUrls {
  spotify: string;
}

interface _ImageData {
  url: string;
  width: number;
  height: number;
}

interface SpotifyArtist {
  external_urls: _ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: 'artist';
  uri: string;
}

interface SpotifyAlbum {
  album_type: 'single' | 'album';
  artists: SpotifyArtist[];
  external_urls: _ExternalUrls;
  href: string;
  id: string;
  images: _ImageData[];
  name: string;
  release_date?: string;
  release_date_precision?: 'day' | 'month' | 'year';
  total_tracks: number;
  type: 'album';
  uri: string;
}

interface SpotifyNowItem {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  disc_number?: number;
  duration_ms?: number;
  explicit?: boolean;
  external_ids?: {
    isrc?: string;
  };
  external_urls: _ExternalUrls;
  href: string;
  id: string;
  is_local?: boolean;
  is_playable?: boolean;
  name: string;
  popularity?: number;
  preview_url?: string;
  track_number?: number;
  type: 'track';
  uri: string;
}

interface SpotifyNowContext {
  external_urls: _ExternalUrls;
  href: string;
  type: 'artist';
  uri: string;
}

export interface SpotifyNowPlaying {
  context: SpotifyNowContext;
  progress_ms: number;
  item: SpotifyNowItem;
  currently_playing_type: 'track' | 'episode';
  is_playing: boolean;
  timestamp: number;
}

export interface SpotifyNowResultData {
  url: string;
  title: string;
  album: {
    name: string;
    date: string;
    cover: string;
    url: string;
  };
  artist: {
    id: string;
    name: string;
    url: string;
  }[];
  progress: number;
  duration: number;
}

export interface SpotifyNowResult {
  playing: boolean;
  data?: SpotifyNowResultData;
}

async function getAccessToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  return await response.json();
}

export async function getNowPlaying(): Promise<SpotifyNowResult> {
  const { access_token } = await getAccessToken();
  const response = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  console.info('Spotify.getNowPlaying:', response.status, response.statusText);
  if (response.status !== 200) {
    return {
      playing: false,
    };
  }
  const jsonData = (await response.json()) as SpotifyNowPlaying;

  const { is_playing, progress_ms, item, currently_playing_type } = jsonData;
  if (currently_playing_type !== 'track') {
    return {
      playing: false,
    };
  }
  const data = {
    url: item['external_urls']['spotify'],
    title: item['name'],
    album: {
      name: item['album']['name'],
      date: item['album']['release_date'],
      cover: item['album']['images'][0]['url'],
      url: item['album']['external_urls']['spotify'],
    },
    artist: item['artists'].map((p) => {
      return {
        id: p.id,
        name: p.name,
        url: p.external_urls?.spotify,
      };
    }),
    progress: progress_ms,
    duration: item['duration_ms'],
  };

  return {
    playing: is_playing,
    data,
  };
}
