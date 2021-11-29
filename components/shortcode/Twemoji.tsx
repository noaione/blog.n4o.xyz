import { mapBoolean } from '@/lib/utils';
import React from 'react';
import Twemoji from 'twemoji';

interface TwemojiEmoteProps {
  children: React.ReactNode | string;
  inline?: boolean;
}

const BASE_URL = 'https://twemoji.maxcdn.com/v/latest/';
const BASE_SIZE = '72x72';

function generateTwemojiUrl(emoji: string) {
  if (emoji.startsWith('1f')) {
    return `${BASE_URL}${BASE_SIZE}/${emoji}.png`;
  }
  const codePoint = Twemoji.convert.toCodePoint(emoji);
  if (typeof codePoint !== 'string') {
    return undefined;
  }
  return `${BASE_URL}${BASE_SIZE}/${codePoint}.png`;
}

export default function TwemojiEmote(props: TwemojiEmoteProps) {
  const { children, inline } = props;
  if (typeof children !== 'string') {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={generateTwemojiUrl(children)}
      alt={`Emote ${children}`}
      title={`:${children}:`}
      className={mapBoolean(inline) ? 'inline-block w-6 h-6 !my-0' : 'w-8 h-8 !my-4'}
    />
  );
}
