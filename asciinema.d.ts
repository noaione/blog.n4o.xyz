declare module "asciinema-player" {
  export interface AsciinemaOptions {
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
    fit?: "both" | "height" | "width" | "none" | boolean;
    terminalFontSize?: number;
    terminalFontFamily?: string;
    terminalLineHeight?: number;
  }

  interface SeekMarkerInput {
    marker: number | "prev" | "next";
  }

  interface SeekMarker {
    index: number;
    time: number;
    label: string;
  }

  type PercentNumber = `${number}%`;

  export class AsciinemaPlayer<T extends HTMLElement> {
    el: T;

    dispose(): void;
    getCurrentTime(): number;
    getDuration(): number;
    play(): void;
    pause(): void;
    seek(location: number | PercentNumber | SeekMarkerInput): void;

    addEventListener(event: "play", listener: () => void): void;
    addEventListener(event: "playing", listener: () => void): void;
    addEventListener(event: "pause", listener: () => void): void;
    addEventListener(event: "ended", listener: () => void): void;
    addEventListener(event: "input", listener: (content: { data: unknown }) => void): void;
    addEventListener(event: "marker", listener: (content: SeekMarker) => void): void;
  }

  function create<T extends HTMLElement>(src: string, element: T, options?: AsciinemaOptions): AsciinemaPlayer<T>;

  export { create };
}
