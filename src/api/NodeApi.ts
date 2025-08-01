import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";
import { GAME_ID_EXPLORER_MOVE, GAME_ID_WOOD, modifyItem, TYPE_COIN, type Item, type ItemMap } from "./ItemApi";
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
  mx: number,
  my: number,
  type: Type,
  status: Status,
  costItem: Item,
  costItemCount: number,
  rewards: Array<NodeReward>,
}

export type NodeMap = Map<number, Node>

export interface NodeReward {
  itemId: number,
  quantity: number,
}

export type NodeFilter = {
  regionNumbers?: Array<number>,
}

export type IslandNodeList = {
  nodes: NodeMap,
  totalCount: number,
  rewards: ItemMap,
}

export class NodeApi {
  private apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest();
    this.apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  async byIslandList(islandId: number, filter?: NodeFilter): Promise<IslandNodeList> {
    const params = new URLSearchParams()
    params.append("islandId", islandId.toString())

    if (filter) {
      if (filter.regionNumbers) {
        params.append("regionNumbers", filter.regionNumbers.join(","))
      }
    }

    const response = await this.apiRequest.get("/island-nodes", params);

    const nodes = new Map<number, Node>()
    let totalCount = 0
    const rewards: ItemMap = {}

    if (response.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.items.forEach((node: any) => {
        nodes.set(node.id, this.modifyNode(node))
      })
      totalCount = response.totalCount;

      console.log(response.rewards)

      for (const id in response.rewards) {
        const reward = response.rewards[id]
        rewards[parseInt(id)] = modifyItem(reward)
      }
    }

    return {
      nodes,
      totalCount,
      rewards,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private modifyNode(data: any): Node {
    let rewards: Array<NodeReward> = []

    if (data.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rewards = data.items.map((itemData: any): NodeReward => {
        return {
          itemId: itemData.itemId,
          quantity: itemData.quantity > 0 ? itemData.quantity : 1,
        }
      });
    }

    // data.cost
    // - itemId
    // - count

    const costItem: Item = {
      id: data.cost.itemId ?? 0,
      name: data.cost ?? "Default cost item", // TODO: locale
      gameId: data.cost.gameId ?? GAME_ID_EXPLORER_MOVE,
      gameType: data.cost.gameType ?? null,
      type: TYPE_COIN,
      iconUrl: null,
      iconWidth: null,
      iconHeight: null,
      emeraldCost: null,
      description: ""
    }

    return {
      id: data.id,
      type: data.typeId ?? TYPE_NODE,
      status: data.statusId ?? STATUS_CREATED,
      costItem,
      costItemCount: 1,
      rewards,
      mx: data.mx,
      my: data.my,
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
