import { createStore as _createStore } from "vuex";

import { IS_SHOW_MENU_MUTATION, HIDE_GLOBAL_NOTIFY, UPDATE_THEME_MUTATION } from "./mutation-types";
import { isValidTheme, THEME_LIGHT, type Theme } from "@/core/theme";

type GlobalNotification = {
  id: number,
  hideAt: Date | null,
}
type GlobalNotificationsMap = { [key: string]: GlobalNotification }
type GlobalNotificationData = {
  id: number,
  hideAt: string | null,
}
type GlobalNotificationsDataMap = { [key: string]: GlobalNotificationData }

let globalNotifications: GlobalNotificationsMap  = {};

let theme: Theme = THEME_LIGHT;
let isShowMenu = true;



const IS_SHOW_MENU_NAME = "isShowMenu";
const NOTIFICATIONS_NAME = "notifications";
const NAME_THEME = "theme";

if (!import.meta.env.SSR) {
  const localIsShowMenu = localStorage.getItem(getName(IS_SHOW_MENU_NAME)) ?? "1";
  isShowMenu = localIsShowMenu === "1";

  const localTheme = localStorage.getItem(getName(NAME_THEME)) ?? THEME_LIGHT;
  if (!isValidTheme(localTheme)) {
    theme = THEME_LIGHT;
  } else {
    theme = localTheme
  }

  const notifactionsJson = localStorage.getItem(getName(NOTIFICATIONS_NAME)) ?? "{}";
  const notifications = JSON.parse(notifactionsJson);

  for (const id in notifications) {
    const notifyData = notifications[id];

    globalNotifications[id] = {
      id: parseInt(id),
      hideAt: notifyData.hideAt ? new Date(notifyData.hideAt) : null,
    };
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
      [IS_SHOW_MENU_MUTATION](state, visible: boolean) {
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
      [UPDATE_THEME_MUTATION](state, theme: Theme) {
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
 */
export function clearGlobalNotifications(state, notifications: Array<GlobalNotification>) {
  for (const id in state.globalNotifications) {
    const notification = state.globalNotifications[id] as GlobalNotification;
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

function getName(name: string): string {
  return "global." + name;
}

function getNotificationsData(globalNotifications: Array<GlobalNotification>): GlobalNotificationsDataMap {
  const notifyData: GlobalNotificationsDataMap = {};

  for (const id in globalNotifications) {
    const notify = globalNotifications[id];
    notifyData[id] = {
      id: notify.id,
      hideAt: notify.hideAt ? notify.hideAt.toISOString() : null,
    };
  }

  return notifyData;
}
