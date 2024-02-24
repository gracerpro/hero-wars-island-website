/**
 * @param {Object} refDialog
 * @returns {Object}
 */
export function useShow(refDialog) {
  let moduleResolve;

  const show = () => {
    return new Promise((resolve) => {
      moduleResolve = resolve;
    })
  }

  const onMountedDialog = () => {
    moduleResolve(refDialog.value.show());
  }

  return {
    show,
    onMountedDialog
  }
}
