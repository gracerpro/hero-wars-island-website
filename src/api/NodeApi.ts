import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";
import { GAME_ID_EXPLORER_MOVE, GAME_ID_WOOD, TYPE_COIN, type Item } from "./ItemApi";
import { ApiList } from "./common";
import type { ComposerTranslation } from "vue-i18n";

export const TYPE_NODE = 0;
export const TYPE_START = 1;
export const TYPE_TOWER = 2;
export const TYPE_CHEST = 3;
export const TYPE_BLOCKER = 4;
export const TYPE_WOOD = 6;
export const TYPE_BUBBLE = 7;

export type Type = 0 | 1 | 2 | 3 | 4 | 6 | 7

export const STATUS_CREATED = 0;
export const STATUS_NOT_SURE = 3;

export type Status = 0 | 3

export const defaultCostItem = {
  typeId: TYPE_COIN,
  gameId: GAME_ID_EXPLORER_MOVE,
  count: 1,
};

export interface Node {
  id: number,
  type: Type,
  status: Status,
  costItem: Item,
}

export type NodeFilter = {
  regionNumbers?: Array<number>
}

export class NodeApi {
  private apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest();
    this.apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  async getList(islandId: number, filter?: NodeFilter): Promise<ApiList<Node>> {
    let params = new URLSearchParams()
    params.append("islandId", islandId.toString())

    if (filter) {
      if (filter.regionNumbers) {
        params.append("regionNumbers", filter.regionNumbers.join(","))
      }
    }

    const response = await this.apiRequest.get("/island-nodes", params);

    let items: Array<Node> = []
    let totalCount = 0

    if (response.items) {
      items = response.items.map((node: any) => this.modifyNode(node));
      totalCount = response.totalCount
    }

    return new ApiList<Node>(items, totalCount);
  }

  /**
   * TODO: it use?
   */
  /*async update(nodeId: number, data): Promise<Node> {
    const response = await this.apiRequest.post(`/island-nodes/${nodeId}/update`, data);

    return this.modifyNode(response);
  }*/

  private modifyNode(response: any): Node {
    let items: Array<Item> = []

    if (response.items) {
      items = response.items.map((data: any) => {
        return {
          description: data.description ?? "",
          quantity: data.quantity > 0 ? data.quantity : 1,
          emeraldCost: data.emeraldCost ?? null,
        }
      });
    }

    return {
      id: response.id,
      type: response.typeId ?? TYPE_NODE,
      status: response.statusId ?? STATUS_CREATED,
      costItem: response.cost ?? defaultCostItem,
    }
  }
}

export function getStatusName(t: ComposerTranslation, status: Status): string {
  const names = {
    [STATUS_CREATED]: t("common.created"),
    [STATUS_NOT_SURE]: t("common.haveDoubts"),
  };

  return names[status] ?? t("common.unknownStatus");
}

export function getTypeName(type: Type): string {
  const map = {
    [TYPE_NODE]: "TYPE_NODE",
    [TYPE_START]: "TYPE_START",
    [TYPE_TOWER]: "TYPE_TOWER",
    [TYPE_CHEST]: "TYPE_CHEST",
    [TYPE_BLOCKER]: "TYPE_BLOCKER",
    [TYPE_WOOD]: "TYPE_WOOD",
    [TYPE_BUBBLE]: "TYPE_BUBBLE",
  };

  return map[type] ?? "";
}

export function isStepType(type: Type) {
  return !(type === TYPE_START || type === TYPE_BLOCKER);
}

export function isCommonStep(costItem: Item) {
  return (
    costItem.type === TYPE_COIN &&
    (costItem.gameId === GAME_ID_EXPLORER_MOVE || costItem.gameId === GAME_ID_WOOD)
  );
}
