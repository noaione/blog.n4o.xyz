import querystring from 'querystring'

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`

async function getAccessToken() {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  console.info('Spotify.Auth:', response.status, response.statusText)
  return await response.json()
}

const mockedNowPlayingData = {
  timestamp: 1622564347047,
  context: {
    external_urls: {
      spotify: 'https://open.spotify.com/artist/1PhE6rv0146ZTQosoPDjk8',
    },
    href: 'https://api.spotify.com/v1/artists/1PhE6rv0146ZTQosoPDjk8',
    type: 'artist',
    uri: 'spotify:artist:1PhE6rv0146ZTQosoPDjk8',
  },
  progress_ms: 6408,
  item: {
    album: {
      album_type: 'single',
      artists: [
        {
          external_urls: {
            spotify: 'https://open.spotify.com/artist/1PhE6rv0146ZTQosoPDjk8',
          },
          href: 'https://api.spotify.com/v1/artists/1PhE6rv0146ZTQosoPDjk8',
          id: '1PhE6rv0146ZTQosoPDjk8',
          name: 'Mori Calliope',
          type: 'artist',
          uri: 'spotify:artist:1PhE6rv0146ZTQosoPDjk8',
        },
      ],
      external_urls: {
        spotify: 'https://open.spotify.com/album/1jVQ4lEhdJ3fOMl9JZGEI3',
      },
      href: 'https://api.spotify.com/v1/albums/1jVQ4lEhdJ3fOMl9JZGEI3',
      id: '1jVQ4lEhdJ3fOMl9JZGEI3',
      images: [
        {
          height: 640,
          url: 'https://i.scdn.co/image/ab67616d0000b273e9114a67fa86d825dac50d8c',
          width: 640,
        },
        {
          height: 300,
          url: 'https://i.scdn.co/image/ab67616d00001e02e9114a67fa86d825dac50d8c',
          width: 300,
        },
        {
          height: 64,
          url: 'https://i.scdn.co/image/ab67616d00004851e9114a67fa86d825dac50d8c',
          width: 64,
        },
      ],
      name: 'DEAD BEATS',
      release_date: '2020-10-20',
      release_date_precision: 'day',
      total_tracks: 4,
      type: 'album',
      uri: 'spotify:album:1jVQ4lEhdJ3fOMl9JZGEI3',
    },
    artists: [
      {
        external_urls: {
          spotify: 'https://open.spotify.com/artist/1PhE6rv0146ZTQosoPDjk8',
        },
        href: 'https://api.spotify.com/v1/artists/1PhE6rv0146ZTQosoPDjk8',
        id: '1PhE6rv0146ZTQosoPDjk8',
        name: 'Mori Calliope',
        type: 'artist',
        uri: 'spotify:artist:1PhE6rv0146ZTQosoPDjk8',
      },
    ],
    disc_number: 1,
    duration_ms: 189677,
    explicit: false,
    external_ids: {
      isrc: 'JPV752003294',
    },
    external_urls: {
      spotify: 'https://open.spotify.com/track/4luSvNPtu6emYsaTOHrguR',
    },
    href: 'https://api.spotify.com/v1/tracks/4luSvNPtu6emYsaTOHrguR',
    id: '4luSvNPtu6emYsaTOHrguR',
    is_local: false,
    is_playable: true,
    name: '失礼しますが、RIP♡',
    popularity: 62,
    preview_url:
      'https://p.scdn.co/mp3-preview/acb9005ba0a82d2130426a6fbb7a0c85d5c5ec9d?cid=774b29d4f13844c495f206cafdad9c86',
    track_number: 2,
    type: 'track',
    uri: 'spotify:track:4luSvNPtu6emYsaTOHrguR',
  },
  currently_playing_type: 'track',
  actions: {
    disallows: {
      resuming: true,
      skipping_prev: true,
    },
  },
  is_playing: true,
}

export async function getNowPlaying(mock = false) {
  let jsonData
  if (mock) {
    jsonData = mockedNowPlayingData
  } else {
    const { access_token } = await getAccessToken()
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    console.info('Spotify.getNowPlaying:', response.status, response.statusText)
    if (response.status !== 200) {
      return {
        playing: false,
      }
    }
    jsonData = await response.json()
  }

  const { context, item, currently_playing_type } = jsonData
  if (currently_playing_type !== 'track') {
    return {
      playing: false,
    }
  }
  const data = {
    url: context['external_urls']['spotify'],
    title: item['name'],
    album: {
      name: item['album']['name'],
      date: item['album']['release_date'],
      url: item['album']['images'][0]['url'],
    },
    artist: item['artists'].map((p) => p.name),
  }

  return {
    playing: true,
    data,
  }
}
