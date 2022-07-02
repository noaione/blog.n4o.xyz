import React, { useEffect, useState } from 'react';

interface ReadingBarProps {
  height?: number;
  background?: string;
}

export default function ReadingBar(props: ReadingBarProps) {
  const height = props.height || 6;
  const background =
    props.background || 'linear-gradient(120deg, rgb(201, 129, 68) 0%, rgb(181, 51, 51) 100%)';

  const [width, setWidth] = useState(0);

  const readingScrollManager = () => {
    const el = document.documentElement;
    const scrollTop = el.scrollTop || document.body.scrollTop;
    const scrollHeight = el.scrollHeight || document.body.scrollHeight;

    const percentage = (scrollTop / (scrollHeight - el.clientHeight)) * 100;
    setWidth(percentage);
  };

  useEffect(() => {
    window.addEventListener('scroll', readingScrollManager);
    return () => {
      window.removeEventListener('scroll', readingScrollManager);
    };
  });

  return (
    <div
      className="fixed rounded-tr-sm top-0 z-10"
      style={{
        width: `${width}%`,
        height: `${height}px`,
        background: background,
      }}
    />
  );
}
