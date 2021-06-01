import { mapBoolean } from '@/lib/utils'
import { getNowPlaying } from '../../lib/spotify'

export default async function SpotifyNowPlayingAPI(req, res) {
  const { query } = req
  if (mapBoolean(query?.mock)) {
    const data = await getNowPlaying(true)
    res.json(data)
  } else {
    const data = await getNowPlaying()
    res.json(data)
  }
}
