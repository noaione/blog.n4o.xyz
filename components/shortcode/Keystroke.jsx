import { Fragment } from 'react'

function tryToSplitStroke(textData) {
  let final = textData.split('-')
  if (final.length !== 1) {
    return final
  }
  final = textData.split('+')
  if (final.length !== 1) {
    return final
  }
  final = textData.split('=')
  return final
}

export default function Keystroke(props) {
  const { children } = props
  if (typeof children !== 'string') {
    return null
  }

  const splitted = tryToSplitStroke(children)
  return (
    <span aria-label={children}>
      {splitted.map((ks, idx) => {
        const addPlus = idx !== splitted.length - 1
        return (
          <Fragment key={`ksf-${ks.toLowerCase()}`}>
            <kbd>{ks.toUpperCase()}</kbd>
            {addPlus && '+'}
          </Fragment>
        )
      })}
    </span>
  )
}
