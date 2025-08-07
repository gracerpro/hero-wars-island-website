export function download(url: string, fileName: string) {
  const e = new MouseEvent('click', {
    view: window,
    bubbles: false,
    cancelable: true,
  })
  const a = document.createElement('a')

  a.download = fileName
  a.href = url
  a.dispatchEvent(e)
  a.remove()
}
