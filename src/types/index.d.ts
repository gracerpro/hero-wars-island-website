export {};

// For extending Window interface
declare global {
	interface Window {
    ym?: any; // Declare 'ym' as an optional property on Window
  }

  interface FullscreenElement extends HTMLElement {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>; // For Firefox
  }
}
