import { isValidTheme, THEME_LIGHT, type Theme } from '@/core/theme'
import { getStoreItemName } from '.'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const NAME_IS_SHOW_MENU = 'isShowMenu'
const NAME_THEME = 'theme'

export const useMainStore = defineStore('main', () => {
  const theme = ref<Theme>(THEME_LIGHT)
  const isShowMenu = ref<boolean>(true)

  if (!import.meta.env.SSR) {
    init()
  }

  function updateTheme(value: Theme) {
    theme.value = value
    localStorage.setItem(getStoreItemName(NAME_THEME), value)
  }

  function updateIsShowMenu(visible: boolean) {
    isShowMenu.value = visible
    localStorage.setItem(getStoreItemName(NAME_IS_SHOW_MENU), visible ? '1' : '0')
  }

  function init() {
    const localIsShowMenu = localStorage.getItem(getStoreItemName(NAME_IS_SHOW_MENU)) ?? '1'
    isShowMenu.value = localIsShowMenu === '1'

    const localTheme = localStorage.getItem(getStoreItemName(NAME_THEME)) ?? THEME_LIGHT
    if (!isValidTheme(localTheme)) {
      theme.value = THEME_LIGHT
    } else {
      theme.value = localTheme
    }
  }

  return {
    theme,
    isShowMenu,
    updateTheme,
    updateIsShowMenu,
  }
})
