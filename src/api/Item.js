import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";

export const TYPE_TYPE_RECIPES = 1;
export const TYPE_TYPE_CONSUMABLE = 2;
export const TYPE_TYPE_COIN = 3;
export const TYPE_PATTERN = 4;
export const TYPE_FRAGMENT = 5;
export const TYPE_SOUL_STONE = 6;
export const TYPE_TYPE_EQUIPMENT = 7;

export default class Item {
  constructor() {
    this._apiRequest = new ApiRequest();
    this._apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  /**
   * @param {Object|null} filter
   * @param {Number} limit
   * @returns {Promise<Object>}
   */
  async getList(limit, filter = null) {
    let params = { limit };

    if (filter) {
      Object.keys(filter).forEach((key) => {
        params[`filter[${key}]`] = filter[key];
      });
    }

    return this._apiRequest.get("/items", params);
  }
}

export function getLabelsByTypes(t) {
  return {
    [TYPE_TYPE_EQUIPMENT]: t("common.equipment"),
    [TYPE_TYPE_RECIPES]: t("common.recipes"),
    [TYPE_TYPE_CONSUMABLE]: t("common.consumable"),
    [TYPE_TYPE_COIN]: t("common.coins"),
    [TYPE_PATTERN]: t("common.pattern", 2),
    [TYPE_FRAGMENT]: t("common.fragment", 2),
    [TYPE_SOUL_STONE]: t("common.soulStones"),
  };
}
