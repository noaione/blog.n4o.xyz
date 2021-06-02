/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Controlled as ControlledZoom } from 'react-medium-image-zoom'
import PropTypes from 'prop-types'
import { useCallback, useState } from 'react'

export default function Image(props) {
  const [isZoomed, setZoomed] = useState(false)

  const handleZoomChange = useCallback((shouldZoom) => {
    setZoomed(shouldZoom)
  }, [])

  return (
    <ControlledZoom
      isZoomed={isZoomed}
      onZoomChange={handleZoomChange}
      zoomMargin={50}
      wrapStyle={{
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <img
        src={props.src}
        alt={props.alt || props.caption || 'Zoomable Image'}
        className={`w-full ${props.caption ? 'mb-0' : ''}`}
        onClick={() => setZoomed(true)}
        style={{
          marginBottom: `${props.caption ? '0.25rem' : '2rem'}`,
        }}
      />
      {props.caption && <figcaption style={{ alignSelf: 'center' }}>{props.caption}</figcaption>}
    </ControlledZoom>
  )
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  caption: PropTypes.string,
}
