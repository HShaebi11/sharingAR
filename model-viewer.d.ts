/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        "ios-src"?: string;
        alt?: string;
        "camera-controls"?: boolean | string;
        ar?: boolean | string;
        "ar-modes"?: string;
        "camera-orbit"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "camera-target"?: string;
        "field-of-view"?: string;
        "auto-rotate"?: boolean | string;
        "rotation-per-second"?: string;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
  }
}
