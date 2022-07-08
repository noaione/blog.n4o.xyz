import React from 'react';

interface AsciinemaOptions {
  cols?: number;
  rows?: number;
  autoPlay?: boolean;
  preload?: boolean;
  loop?: boolean | number;
  startAt?: number | string;
  speed?: number;
  idleTimeLimit?: number;
  theme?: string;
  poster?: string;
  fit?: 'both' | 'height' | 'width' | 'none' | boolean;
  terminalFontSize?: number;
  terminalFontFamily?: string;
  terminalLineHeight?: number;
}

interface AsciinemaPlayerProps extends AsciinemaOptions {
  src: string;
}

export default class Asciinema extends React.Component<AsciinemaPlayerProps> {
  ref: React.RefObject<HTMLDivElement>;
  static defaultOptions: AsciinemaOptions = {
    preload: true,
    fit: 'width',
    idleTimeLimit: 3,
  };

  constructor(props: AsciinemaPlayerProps) {
    super(props);
    this.ref = React.createRef();
  }

  async componentDidMount() {
    // import asciinema
    console.info('importing asciinema');

    const asciinema = await import('asciinema-player');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { src, children: _, ...asciiOptions } = this.props;
    const mergedOptions = { ...Asciinema.defaultOptions, ...asciiOptions };
    console.info(`rendering asciinema: ${src}`);
    asciinema.create(src, this.ref.current, mergedOptions);
  }

  render() {
    return <div ref={this.ref} />;
  }
}
