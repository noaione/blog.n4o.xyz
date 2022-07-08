declare module 'asciinema-player' {
  type AsciinemaFit = 'both' | 'height' | 'width' | 'none' | boolean;
  type AsciinemaPlayerOptions = {
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
    fit?: AsciinemaFit;
    terminalFontSize?: number;
    terminalFontFamily?: string;
    terminalLineHeight?: number;
  };

  export function create(source: string, elem: HTMLElement, options?: AsciinemaPlayerOptions): void;
}
