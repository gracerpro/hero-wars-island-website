import type { Ref } from 'vue'

export interface DialogShow {
  show: () => Promise<unknown>
  onMountedDialog: () => void
}

export type DialogResult = object | number | string | null

export function useShow(refDialog: Ref /* Ref<typeof ModalDialog> */): DialogShow {
  let moduleResolve: (value: unknown) => void

  const show = () => {
    return new Promise((resolve) => {
      moduleResolve = resolve
    })
  }

  const onMountedDialog = () => {
    refDialog.value.show().then((result: DialogResult) => {
      moduleResolve(result)
    })
  }

  return {
    show,
    onMountedDialog,
  }
}
