import React from 'react'

export default function Skeleton({
  count,
  duration,
  width,
  wrapper: Wrapper,
  height,
  circle,
  style: customStyle,
  className: customClassName,
}) {
  const elements = []

  for (let i = 0; i < count; i++) {
    let style = {}

    if (width !== null) {
      style.width = width
    }

    if (height !== null) {
      style.height = height
    }

    if (width !== null && height !== null && circle) {
      style.borderRadius = '50%'
    }

    let className = 'react-loading-skeleton'
    if (customClassName) {
      className += ' ' + customClassName
    }

    elements.push(
      <span
        key={i}
        className={className}
        style={{
          ...customStyle,
          ...style,
        }}
      >
        &zwnj;
      </span>
    )
  }

  return (
    <span>
      {Wrapper
        ? elements.map((element, i) => (
            <Wrapper key={i}>
              {element}
              &zwnj;
            </Wrapper>
          ))
        : elements}
    </span>
  )
}

Skeleton.defaultProps = {
  count: 1,
  duration: 1.2,
  width: null,
  wrapper: null,
  height: null,
  circle: false,
  style: {},
  className: '',
}
