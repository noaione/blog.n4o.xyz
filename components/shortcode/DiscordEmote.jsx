import React from 'react'

import EmoteData from './emote.json'

export default function DiscordEmote(props) {
  const { children } = props
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
      className="w-8 h-8"
      style={{ marginTop: '1rem', marginBottom: '1rem' }}
      alt={`:${emote.name}:`}
      title={`:${emote.name}:`}
      src={emote.url}
    />
  )
}
