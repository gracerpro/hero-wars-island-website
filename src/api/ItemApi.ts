import { getCurrentLocale } from '@/i18n/translation'
import ApiRequest from '../core/ApiRequest'
import { ApiList } from './common'
import type { ComposerTranslation } from 'vue-i18n'

export enum Type {
  Recipes = 1,
  Consumable = 2,
  Coin = 3,
  BannerStone = 4,
  Fragment = 5,
  SoulStone = 6,
  Equipment = 7,
  Gold = 8,
  StarMoney = 9,
  Avatar = 10,
  Banner = 11,
  Unknown = 12,
  AvatarFrame = 13,
  Stamina = 14,
}
const allTypes = new Set<number>(Object.values(Type).filter((a) => typeof a === 'number'))

export function isType(a: number): a is Type {
  return allTypes.has(a as Type)
}

export const GAME_ID_EXPLORER_MOVE = 41
export const GAME_ID_WOOD = 53

export interface Item {
  id: number
  name: string
  gameId: number | null
  gameType: string | null
  type: Type
  iconUrl: string | null
  iconWidth: number | null
  iconHeight: number | null
  emeraldCost: number | null
  description: string
}

const unknownItem: Item = {
  id: 0,
  name: 'Unknown',
  gameId: null,
  gameType: null,
  type: Type.Unknown,
  iconUrl: null,
  iconWidth: null,
  iconHeight: null,
  emeraldCost: null,
  description: '',
}

export function getUnknownItem(): Item {
  return unknownItem
}

export type ItemMap = { [key: number]: Item }

export type ItemFilter = {
  name?: string
}

export class ItemApi {
  apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest()
    this.apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale())
    })
  }

  async getList(limit: number, filter?: ItemFilter): Promise<ApiList<Item>> {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())

    if (filter) {
      if (filter.name) {
        params.append('filter[${key}]', filter.name)
      }
    }

    const response = await this.apiRequest.get('/items', params)

    let items: Array<Item> = []
    let totalCount: number = 0

    if (response.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items = response.items.map((item: any) => modifyItem(item))
      totalCount = response.totalCount
    }

    return new ApiList<Item>(items, totalCount)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function modifyItem(data: any): Item {
  return {
    id: data.id,
    name: data.name,
    type: isType(data.typeId) ? data.typeId : Type.Unknown,
    gameId: data.gameId ?? null,
    gameType: data.gameType ?? null,
    iconUrl: data.iconUrl ?? null,
    iconWidth: data.iconWidth ?? null,
    iconHeight: data.iconHeight ?? null,
    emeraldCost: data.emeraldCost ?? null,
    description: data.description ?? '',
  }
}

export function getLabelsByTypes(t: ComposerTranslation) {
  return {
    [Type.Equipment]: t('common.equipment'),
    [Type.Recipes]: t('common.recipes'),
    [Type.Consumable]: t('common.consumable'),
    [Type.Coin]: t('common.coins'),
    [Type.BannerStone]: t('common.bannerStone', 2),
    [Type.Fragment]: t('common.fragment', 2),
    [Type.SoulStone]: t('common.soulStones'),
    [Type.Gold]: t('common.gold'),
    [Type.StarMoney]: t('common.starmoney'),
    [Type.Avatar]: t('common.avatarType'),
    [Type.Banner]: t('common.bannerType'),
    [Type.Unknown]: t('common.unknown'),
    [Type.AvatarFrame]: t('common.avatarFrame'),
    [Type.Stamina]: t('common.stamina'),
  }
}

export function getTypeName(type: Type, t: ComposerTranslation): string {
  const labelsByTypes = getLabelsByTypes(t)

  return labelsByTypes[type] ?? ''
}
