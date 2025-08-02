export {};

// For extending Window interface
declare global {
	interface Window {
    ym?: any; // Declare 'ym' as an optional property on Window
    __INITIAL_STATE__: any;
  }

  interface FullscreenElement extends Element {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>; // For Firefox
  }
}
