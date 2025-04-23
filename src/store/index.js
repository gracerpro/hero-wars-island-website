import { createStore as _createStore } from "vuex";

import { IS_SHOW_MENU_MUTATION, HIDE_GLOBAL_NOTIFY, UPDATE_THEME_MUTATION } from "./mutation-types";
import { isValidTheme, THEME_LIGHT } from "@/core/theme";

let theme = THEME_LIGHT
let isShowMenu = true;
let globalNotifications = {};

const IS_SHOW_MENU_NAME = "isShowMenu";
const NOTIFICATIONS_NAME = "notifications";
const NAME_THEME = "theme"

if (!import.meta.env.SSR) {
  const localIsShowMenu = localStorage.getItem(getName(IS_SHOW_MENU_NAME)) ?? "1";
  isShowMenu = localIsShowMenu > 0;

  theme = localStorage.getItem(getName(NAME_THEME)) ?? THEME_LIGHT
  if (!isValidTheme(theme)) {
    theme = THEME_LIGHT
  }

  const notifactionsJson = localStorage.getItem(getName(NOTIFICATIONS_NAME)) ?? "{}";
  const notifications = JSON.parse(notifactionsJson);

  for (const id in notifications) {
    const notify = notifications[id];
    if (notify.hideAt) {
      notify.hideAt = new Date(notify.hideAt);
    }
    globalNotifications[id] = notify;
  }
}

export function createStore() {
  return _createStore({
    state: {
      isShowMenu,
      globalNotifications,
      theme,
    },
    getters: {},
    mutations: {
      /** @param {Boolean} visible */
      [IS_SHOW_MENU_MUTATION](state, visible) {
        state.isShowMenu = visible;
        localStorage.setItem(getName(IS_SHOW_MENU_NAME), visible ? "1" : "0");
      },
      /**
       * @param {Object} payload
       */
      [HIDE_GLOBAL_NOTIFY](state, payload) {
        state.globalNotifications[payload.id] = {
          id: payload.id,
          hideAt: new Date(),
        };
        const notifyData = getNotificationsData(state.globalNotifications);
        localStorage.setItem(getName(NOTIFICATIONS_NAME), JSON.stringify(notifyData));
      },
      /**
       * @param {String} theme
       */
      [UPDATE_THEME_MUTATION](state, theme) {
        state.theme = theme;
        localStorage.setItem(getName(NAME_THEME), theme);
      },
    },
    actions: {},
    modules: {},
  });
}

/**
 * @param {Object} state
 * @param {Array} notifications
 */
export function clearGlobalNotifications(state, notifications) {
  for (const id in state.globalNotifications) {
    const notification = state.globalNotifications[id];
    const exists = notifications.find((item) => item.id === notification.id);

    if (!exists) {
      delete state.globalNotifications[id];
    }
  }

  const itemName = getName(NOTIFICATIONS_NAME);
  if (Object.keys(state.globalNotifications).length === 0) {
    localStorage.removeItem(itemName);
  } else {
    const notifyData = getNotificationsData(state.globalNotifications);
    localStorage.setItem(itemName, JSON.stringify(notifyData));
  }
}

/**
 * @param {String} name
 * @returns {String}
 */
function getName(name) {
  return "global." + name;
}

/**
 * @param {Object} globalNotifications
 * @returns {Object}
 */
function getNotificationsData(globalNotifications) {
  const notifyData = {};
  for (const id in globalNotifications) {
    const notify = globalNotifications[id];
    notifyData[id] = {
      id: notify.id,
      hideAt: notify.hideAt.toISOString(),
    };
  }

  return notifyData;
}
