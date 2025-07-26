import type { Ref } from "vue";

export interface DialogShow {
  show: () => Promise<unknown>,
  onMountedDialog: () => void,
}

export type DialogResult = object | number | string | null

export function useShow(refDialog: Ref): DialogShow {
  let moduleResolve: (value: unknown) => void;

  const show = () => {
    return new Promise((resolve) => {
      moduleResolve = resolve;
    });
  };

  const onMountedDialog = () => {
    moduleResolve(refDialog.value.show());
  };

  return {
    show,
    onMountedDialog,
  };
}
