import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";
import { ApiList } from "./common";
import type { ComposerTranslation } from "vue-i18n";

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
export const TYPE_AVATAR_FRAME = 13;
export const TYPE_STAMINA = 14;

export type Type = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

export const GAME_ID_EXPLORER_MOVE = 41;
export const GAME_ID_WOOD = 53;

export interface Item {
  id: number,
  name: string,
  gameId: number | null,
  type: Type,
  iconUrl: string | null,
  iconWidth: number | null,
  iconHeight: number | null,
  emeraldCost: number | null,
  description: string,
}

export type ItemMap = { [key: number]: Item }

export type ItemFilter = {
  name?: string
}

export class ItemApi {
  apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest();
    this.apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  async getList(limit: number, filter?: ItemFilter): Promise<ApiList<Item>> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString())

    if (filter) {
      if (filter.name) {
        params.append("filter[${key}]", filter.name)
      }
    }

    const response = await this.apiRequest.get("/items", params);

    let items: Array<Item> = []
    let totalCount: number = 0

    if (response.items) {
      items = response.items.map((item: any) => modifyItem(item))
      totalCount = response.totalCount
    }

    return new ApiList<Item>(items, totalCount)
  }
}

export function modifyItem(data: any): Item  {
  return {
    id: data.id,
    name: data.name,
    type: data.typeId, // TODO: validate type? if null then TYPE_UNKNOWN
    gameId: data.gameId ?? null,
    iconUrl: data.iconUrl ?? null,
    iconWidth: data.iconWidth ?? null,
    iconHeight: data.iconHeight ?? null,
    emeraldCost: data.emeraldCost ?? null,
    description: data.description ?? "",
  }
}

export function getLabelsByTypes(t: ComposerTranslation) {
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
    [TYPE_UNKNOWN]: t("common.unknown"),
    [TYPE_AVATAR_FRAME]: t("common.avatarFrame"),
    [TYPE_STAMINA]: t("common.stamina"),
  };
}

export function getTypeName(type: Type, t: ComposerTranslation): string {
  const labelsByTypes = getLabelsByTypes(t)

  return labelsByTypes[type] ?? "";
}
