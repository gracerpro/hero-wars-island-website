import { createStore as _createStore } from "vuex";

import { IS_SHOW_MENU_MUTATION } from "./mutation-types";

let isShowMenu = true;

const GLOBAL_NAME = "global";

if (!import.meta.env.SSR) {
  const localIsShowMenu = localStorage.getItem(getName("isShowMenu")) ?? "1";
  isShowMenu = localIsShowMenu > 0;
}

export function createStore() {
  return _createStore({
    state: {
      isShowMenu,
    },
    getters: {},
    mutations: {
      /** @param {Boolean} visible */
      [IS_SHOW_MENU_MUTATION](state, visible) {
        state.isShowMenu = visible;
        localStorage.setItem(getName("isShowMenu"), visible ? "1" : "0");
      },
    },
    actions: {},
    modules: {},
  });
}

function getName(name) {
  return GLOBAL_NAME + "." + name;
}
