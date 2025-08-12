type BeforeUnloadCallback = () => void

const beforeUnloadCallbacks = new Set<BeforeUnloadCallback>()

export function AddOnBeforeUnload(callback: BeforeUnloadCallback) {
  if (beforeUnloadCallbacks.size === 0) {
    window.addEventListener('beforeunload', onBeforeUnload)
  }
  beforeUnloadCallbacks.add(callback)
}

export function RemoveOnBeforeUnload(callback: BeforeUnloadCallback) {
  if (beforeUnloadCallbacks.size === 1) {
    window.removeEventListener('beforeunload', onBeforeUnload)
  }
  beforeUnloadCallbacks.delete(callback)
}

function onBeforeUnload(event: BeforeUnloadEvent): string {
  event.returnValue = ''

  beforeUnloadCallbacks.forEach((callback) => callback())

  return ''
}
