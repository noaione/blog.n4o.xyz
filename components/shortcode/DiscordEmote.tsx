/* eslint-disable @next/next/no-img-element */
import { mapBoolean } from '@/lib/utils'
import React from 'react'

import EmoteData from './emote.json'

interface DiscordEmoteProps {
  children: React.ReactNode | string
  inline?: boolean
}

export default function DiscordEmote(props: DiscordEmoteProps) {
  const { children, inline } = props
  if (typeof children !== 'string') {
    return null
  }
  const findEmote = EmoteData.findIndex((value) => children === value.name)
  if (findEmote === -1) {
    return null
  }
  const emote = EmoteData[findEmote]

  return (
    <img
      src={emote.url}
      alt={`:${emote.name}:`}
      title={`:${emote.name}:`}
      className={mapBoolean(inline) ? 'inline-block w-6 h-6 !my-0' : 'w-8 h-8 !my-4'}
    />
  )
}
