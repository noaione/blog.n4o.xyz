import React from 'react'

import EmoteData from './emote.json'

export default function DiscordEmote(props) {
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
      className={`${inline ? 'inline-block w-6 h-6' : 'w-8 h-8'}`}
      style={{ marginTop: inline ? '0' : '1rem', marginBottom: inline ? '0' : '1rem' }}
      alt={`:${emote.name}:`}
      title={`:${emote.name}:`}
      src={emote.url}
    />
  )
}
