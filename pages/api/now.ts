import { mapBoolean } from '@/lib/utils';
import { getNowPlaying } from '@/lib/spotify';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function SpotifyNowPlayingAPI(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req;
  if (mapBoolean(query?.mock)) {
    const data = await getNowPlaying(true);
    res.json(data);
  } else {
    const data = await getNowPlaying();
    res.json(data);
  }
}
