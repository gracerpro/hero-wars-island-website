import { getCurrentLocale } from '@/i18n/translation'
import ApiRequest from '../core/ApiRequest'
import { ApiList } from './common'

export interface OneNews {
  id: number
  slug: string
  name: string
  createdAt: Date
  updatedAt: Date
  snippet: string
  content?: string
  pageTitle?: string
  pageDescription?: string
  pageKeywords?: string
}

export type NewsFilter = {
  name?: string
}

export class NewsApi {
  private apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest()
    this.apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale())
    })
  }

  /**
   * @param {Number} pageSize
   * @param {Number} pageNumber
   * @param {Object|null} filter
   * @returns {Promise<Object|null>}
   */
  async getList(
    pageSize: number,
    pageNumber: number = 1,
    filter?: NewsFilter
  ): Promise<ApiList<OneNews>> {
    const params = new URLSearchParams()
    params.append('pageSize', pageSize.toString())
    params.append('fields[isWithSeo]', '0')
    params.append('fields[isWithContent]', '0')

    if (pageNumber > 1) {
      params.append('pageNumber', pageNumber.toString())
    }
    if (filter) {
      if (filter.name) {
        params.append('filter[name]', filter.name)
      }
    }

    const response = await this.apiRequest.get('/news', params)

    let items: Array<OneNews> = []
    let totalCount = 0

    if (response.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items = response.items.map((oneNews: any) => this.modifyOneNews(oneNews))
      totalCount = response.totalCount
    }

    return new ApiList<OneNews>(items, totalCount)
  }

  async get(slug: string): Promise<OneNews | null> {
    const response = await this.apiRequest.get('/news/view?slug=' + slug)

    if (response) {
      return this.modifyOneNews(response)
    }

    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private modifyOneNews(data: any): OneNews {
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      snippet: data.snippet,
    }
  }
}
