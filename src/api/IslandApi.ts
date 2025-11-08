import { getCurrentLocale } from '@/i18n/translation'
import ApiRequest from '../core/ApiRequest'
import { ApiList } from './common'

export interface Image {
  url: string
  width: number
  height: number
  size: number
}

export interface Region {
  number: number
  startAt: Date | null
  isVisible: boolean
}

export interface Island {
  id: number
  eventStartAt: Date
  eventEndAt: Date
  name: string
  description?: string
  nodesLastUpdatedAt?: Date | null
  syncGameVersion: string | null
  syncAt: Date | null
  backgroundImage: Image | null
  pageTitle?: string
  pageDescription?: string
  pageKeywords?: string
  regions: Array<Region>
}

export class DataParams {
  readonly isWithDescription: boolean
  readonly isWithBackgroundImage: boolean

  constructor(isWithDescription: boolean = false, isWithBackgroundImage: boolean = false) {
    this.isWithDescription = isWithDescription
    this.isWithBackgroundImage = isWithBackgroundImage
  }
}

export class IslandApi {
  apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest()
    this.apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale())
    })
  }

  async get(id: number, dataParams: DataParams): Promise<Island | null> {
    const params = new URLSearchParams()

    if (dataParams.isWithDescription) {
      params.append('isWithDescription', '1')
    }
    if (dataParams.isWithBackgroundImage) {
      params.append('isWithBackgroundImage', '1')
    }
    const response = await this.apiRequest.get('/islands/' + id, params)
    let island = null

    if (response) {
      island = this.modifyIsland(response)
    }

    return island
  }

  /**
   * @returns {Promise<Object|null>}
   */
  async getActual() {
    const params = new URLSearchParams()
    params.append('isWithSeo', '0')
    params.append('isWithDescription', '0')

    const response = await this.apiRequest.get('/islands/actual', params)
    let island = null

    if (response) {
      island = this.modifyIsland(response)
    }

    return island
  }

  async getList(pageSize: number, pageNumber: number = 1): Promise<ApiList<Island>> {
    const params = new URLSearchParams()
    params.append('pageSize', pageSize.toString())
    params.append('fields[isWithDescription]', '0')
    params.append('fields[isWithSeo]', '0')

    if (pageNumber > 1) {
      params.append('pageNumber', pageNumber.toString())
    }

    const response = await this.apiRequest.get('/islands', params)

    let items: Array<Island> = []
    let totalCount = 0

    if (response.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items = response.items.map((island: any) => this.modifyIsland(island))
      totalCount = response.totalCount
    }

    return new ApiList<Island>(items, totalCount)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private modifyIsland(data: any): Island {
    const regions: Array<Region> = []
    let image: Image | null = null

    if (data.regions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.regions.forEach((regionData: any) => {
        regions.push({
          number: regionData.number,
          startAt: regionData.startAt ? new Date(regionData.startAt) : null,
          isVisible: regionData.isVisible,
        })
      })
    }
    if (data.backgroundImage) {
      image = {
        url: data.backgroundImage.url,
        width: data.backgroundImage.width,
        height: data.backgroundImage.height,
        size: data.backgroundImage.size,
      }
    }

    return {
      id: data.id,
      eventStartAt: new Date(data.eventStartAt),
      eventEndAt: new Date(data.eventEndAt),
      name: data.name,
      nodesLastUpdatedAt: data.nodesLastUpdatedAt ? new Date(data.nodesLastUpdatedAt) : null,
      regions,
      syncGameVersion: data.syncGameVersion ?? null,
      syncAt: data.syncAt ?? null,
      backgroundImage: image,
      pageTitle: data.pageTitle,
      pageDescription: data.pageDescription,
      pageKeywords: data.pageKeywords,
    }
  }
}
