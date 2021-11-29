import React from 'react';

interface SkeletonLoader {
  count: number;
  duration?: number;
  width?: number;
  height?: number;
  circle?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function Skeleton({
  count,
  width,
  height,
  circle,
  style: customStyle,
  className: customClassName,
}: SkeletonLoader) {
  const elements = [];

  for (let i = 0; i < count; i++) {
    const style: React.CSSProperties = {};

    if (width !== null) {
      style.width = width;
    }

    if (height !== null) {
      style.height = height;
    }

    if (width !== null && height !== null && circle) {
      style.borderRadius = '50%';
    }

    let className = 'react-loading-skeleton';
    if (customClassName) {
      className += ' ' + customClassName;
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
    );
  }

  return <span>{elements}</span>;
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
};
