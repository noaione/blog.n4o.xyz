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
