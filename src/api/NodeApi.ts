import { getCurrentLocale } from '@/i18n/translation'
import ApiRequest from '../core/ApiRequest'
import {
  GAME_ID_EXPLORER_MOVE,
  GAME_ID_WOOD,
  GameType,
  getGameType,
  Type as ItemType,
  modifyItem,
  type ItemMap,
} from './ItemApi'
import type { ComposerTranslation } from 'vue-i18n'

export enum Type {
  Node = 0,
  Start = 1,
  Tower = 2,
  Chest = 3,
  Blocker = 4,
  // 5
  Wood = 6,
  Bubble = 7,
  SummerFest2025 = 8,
  Banner = 9,
  Presents = 10,
  Presents_2 = 11,
  Lantern = 12,
}
const allTypes = new Set<number>(Object.values(Type).filter((a) => typeof a === 'number'))

export function isType(a: number): a is Type {
  return allTypes.has(a as Type)
}

export enum Status {
  Created = 0,
  NotSure = 3,
}

export interface CostItem {
  readonly type: ItemType
  readonly gameId: number | null
}

export interface NodeReward {
  readonly itemId: number
  readonly quantity: number
  gameId?: number
  gameType?: string
}

export interface StepItem {
  readonly quantity: number
  readonly gameId: number | null
  readonly gameType: GameType
}

export interface Step {
  readonly id: number
  readonly costs: StepItem[]
  readonly rewards: StepItem[]
  readonly countdownEndDate?: Date
  readonly countdownInterval?: number
}

export interface Node {
  readonly id: number
  readonly mx: number
  readonly my: number
  readonly type: Type
  readonly status: Status
  readonly costItem: CostItem
  readonly costItemCount: number
  readonly rewards: Array<NodeReward>
  readonly steps?: Step[]
}

export type NodeMap = Map<number, Node>

export type NodeFilter = {
  regionNumbers?: Array<number>
}

export type TypeGameIdToItemMap = { [typeAndId: string]: number }

export type IslandNodeList = {
  nodes: NodeMap
  nodesTotalCount: number
  rewards: ItemMap
  gameItemMap: TypeGameIdToItemMap
}

export class NodeApi {
  private apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest()
    this.apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale())
    })
  }

  async byIslandList(islandId: number, filter?: NodeFilter): Promise<IslandNodeList> {
    const params = new URLSearchParams()
    params.append('islandId', islandId.toString())

    if (filter) {
      if (filter.regionNumbers) {
        params.append('regionNumbers', filter.regionNumbers.join(','))
      }
    }

    const response = await this.apiRequest.get('/island-nodes', params)

    const nodes = new Map<number, Node>()
    let totalCount = 0
    const rewards: ItemMap = {}
    let gameItemMap: TypeGameIdToItemMap = {}

    if (response.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.items.forEach((node: any) => {
        nodes.set(node.id, this.modifyNode(node))
      })
      totalCount = response.totalCount

      for (const id in response.rewards) {
        const reward = response.rewards[id]
        rewards[parseInt(id)] = modifyItem(reward)
      }

      gameItemMap = response.gameItemMap
    }

    return {
      nodes,
      nodesTotalCount: totalCount,
      rewards,
      gameItemMap,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private modifyNode(data: any): Node {
    let rewards: NodeReward[] = []

    if (data.rewards) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rewards = data.rewards.map((rewardData: any): NodeReward => {
        const reward: NodeReward = {
          itemId: rewardData.itemId,
          quantity: rewardData.quantity > 0 ? rewardData.quantity : 1,
        }
        if (rewardData.gameId) {
          reward.gameId = rewardData.gameId
        }
        if (rewardData.gameType) {
          reward.gameType = rewardData.gameType
        }

        return reward
      })
    }

    let costItem: CostItem = {
      gameId: null,
      type: ItemType.Unknown
    }
    let costItemCount = 0

    if (data.cost) {
      costItem = {
        gameId: data.cost.gameId,
        type: data.cost.typeId ?? ItemType.Unknown,
      }
      costItemCount = data.cost.count
    }

    let resultType: Type

    if (data.typeId !== undefined && data.typeId !== null) {
      if (isType(data.typeId)) {
        resultType = data.typeId
      } else {
        console.warn('Unknown node type "' + data.typeId + '".')
        resultType = Type.Blocker
      }
    } else {
      resultType = Type.Node
    }

    let steps: Step[] | undefined = undefined

    if (data.steps) {
      data.steps
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => {
        if (a.id === b.id) {
          return 0
        }
        return a.id < b.id ? -1 : 1;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      steps = data.steps.map((item: any) => {
        return {
          id: item.id,
          rewards: getRewardCostItems(item.reward),
          costs: getRewardCostItems(item.cost),
          countdownEndDate: item.countdownEndDate ? getCountdownEndDate(item.countdownEndDate) : null,
          countdownInterval: item.countdownInterval ?? 0,
        }
      })
    } else {
      steps = [
        {
          id: 1,
          costs: [
            {
              quantity: costItemCount,
              gameId: costItem.gameId,
              gameType: getGameType(costItem.type),
            }
          ],
          rewards: rewards.map((reward) => ({
            quantity: reward.quantity,
            gameId: reward.gameId ?? null,
            gameType: reward.gameType as (GameType | undefined) ?? GameType.Null,
          }))
        }
      ]
    }

    return {
      id: data.id,
      type: resultType,
      status: data.statusId ?? Status.Created,
      costItem,
      costItemCount,
      rewards,
      mx: data.mx,
      my: data.my,
      steps
    }
  }
}

function getCountdownEndDate(gameDate: string): Date | null {
  let date = null

  try {
    if (gameDate.length === 16 /* 16 = '9999-01-01 01:00'.length */) {
      const arr = gameDate.split(' ')
      date = new Date(arr[0] + 'T' + arr[1] + ':00Z')
      console.log(arr[0] + 'T' + arr[1] + ':00Z')
    } else {
      date = new Date(gameDate);
    }
  } catch (error: unknown) {
    console.error(error)
    date = null
  }

  return date
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRewardCostItems(gameMap: any): StepItem[] {
  const items: StepItem[] = []

  for (const gameType in gameMap) {
    const itemCost = gameMap[gameType]

    if (typeof itemCost === 'number') {
      items.push({
        quantity: itemCost,
        gameId: null,
        gameType: gameType as GameType
      })
    } else {
      for (const id in itemCost) {
        items.push({
          quantity: itemCost[id],
          gameId: parseInt(id),
          gameType: gameType as GameType
        })
      }
    }
  }

  return items
}

export function getStatusName(t: ComposerTranslation, status: Status): string {
  const names = {
    [Status.Created]: t('common.created'),
    [Status.NotSure]: t('common.haveDoubts'),
  }

  return names[status] ?? t('common.unknownStatus')
}

export function getTypeName(type: Type): string {
  const map = {
    [Type.Node]: 'TYPE_NODE',
    [Type.Start]: 'TYPE_START',
    [Type.Tower]: 'TYPE_TOWER',
    [Type.Chest]: 'TYPE_CHEST',
    [Type.Blocker]: 'TYPE_BLOCKER',
    [Type.Wood]: 'TYPE_WOOD',
    [Type.Bubble]: 'TYPE_BUBBLE',
    [Type.SummerFest2025]: 'TYPE_SUMMER_FEST_2025',
    [Type.Banner]: 'TYPE_BANNER',
    [Type.Presents]: 'TYPE_PRESENTS',
    [Type.Presents_2]: 'TYPE_PRESENTS_2',
    [Type.Lantern]: 'TYPE_LANTERN',
  }

  return map[type] ?? ''
}

export function isStepType(type: Type) {
  return !(type === Type.Start || type === Type.Blocker)
}

export function isCommonStep(costItem: CostItem) {
  return (
    costItem.type === ItemType.Coin &&
    (costItem.gameId === GAME_ID_EXPLORER_MOVE || costItem.gameId === GAME_ID_WOOD)
  )
}
