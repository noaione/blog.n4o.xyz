import React from 'react';

export default function LiteralIcon(props: React.SVGProps<SVGSVGElement>) {
  const { className, ...restProps } = props;
  return (
    <svg
      width="61"
      height="81"
      viewBox="0 0 61 81"
      className={`dark:fill-white fill-black ${className || ''}`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <path d="M27.6484 19.376L38.3742 20.1131L31.9826 28.9422L36.9726 32.4481L43.6189 23.1952L48.8902 33.2671L54.3281 30.4778L49.3235 20.8655L59.9003 21.5924L60.3274 15.5899L49.6016 14.8528L55.9984 5.95051L51.0084 2.44457L44.4418 11.6295L39.2398 1.63582L33.8019 4.42514L38.8758 14.1157L28.0755 13.3735L27.6484 19.376Z" />
      <path d="M0.50323 51.1446L29.0441 55.0866L30.2495 46.6574L10.2857 43.9L16.3544 1.46357L7.77734 0.278931L0.50323 51.1446Z" />
      <path d="M60.484 72.7423L4.87535 80.4228L3.66992 71.9937L59.2786 64.3131L60.484 72.7423Z" />
      <title>Literal</title>
    </svg>
  );
}
