import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";

export const TYPE_RECIPES = 1;
export const TYPE_CONSUMABLE = 2;
export const TYPE_COIN = 3;
export const TYPE_BANNER_STONE = 4;
export const TYPE_FRAGMENT = 5;
export const TYPE_SOUL_STONE = 6;
export const TYPE_EQUIPMENT = 7;
export const TYPE_GOLD = 8;
export const TYPE_STARMONEY = 9;
export const TYPE_AVATAR = 10;
export const TYPE_BANNER = 11;
export const TYPE_UNKNOWN = 12;

export const GAME_ID_EXPLORER_MOVE = 41;
export const GAME_ID_WOOD = 53;

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
    [TYPE_EQUIPMENT]: t("common.equipment"),
    [TYPE_RECIPES]: t("common.recipes"),
    [TYPE_CONSUMABLE]: t("common.consumable"),
    [TYPE_COIN]: t("common.coins"),
    [TYPE_BANNER_STONE]: t("common.bannerStone", 2),
    [TYPE_FRAGMENT]: t("common.fragment", 2),
    [TYPE_SOUL_STONE]: t("common.soulStones"),
    [TYPE_GOLD]: t("common.gold"),
    [TYPE_STARMONEY]: t("common.starmoney"),
    [TYPE_AVATAR]: t("common.avatarType"),
    [TYPE_BANNER]: t("common.bannerType"),
  };
}
