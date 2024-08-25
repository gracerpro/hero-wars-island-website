/**
 * @param {String} url 
 * @param {String} fileName 
 */
export function download(url, fileName) {
  const e = new MouseEvent("click", {
    view: window,
    bubbles: false,
    cancelable: true
  });
  const a = document.createElement("a");

  a.download = fileName;
  a.href = url
  a.dispatchEvent(e);
  a.remove()
}
