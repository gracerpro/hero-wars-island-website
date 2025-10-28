import { getCurrentLocale } from '@/i18n/translation'
import ApiRequest from '../core/ApiRequest'
import { ApiList } from './common'
import type { ComposerTranslation } from 'vue-i18n'

export enum Status {
  Created = 'created',
  InProgress = 'in_process',
  Moderated = 'moderated',
  Abort = 'abort',
  Closed = 'closed',
  Queue = 'queue',
}

export interface Feedback {
  id: number
  createdAt: Date
  status: Status
  subject: string
  message: string
  answer: string
  username: string
}

export interface FeedbackData {
  contactEmail: string
  tempField: string
  submitTimeInMs: number
  username: string
  email: string
  subject: string
  message: string
}

export class FeedbackApi {
  private apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest()
    this.apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale())
    })
  }

  async create(data: FeedbackData): Promise<Feedback> {
    const response = await this.apiRequest.post('/feedback-items/create', data)

    return this.modifyFeedback(response)
  }

  async getList(pageSize: number, pageNumber: number = 1): Promise<ApiList<Feedback>> {
    const params = new URLSearchParams()
    params.append('pageSize', pageSize.toString())

    if (pageNumber > 1) {
      params.append('pageNumber', pageNumber.toString())
    }

    const response = await this.apiRequest.get('/feedback-items', params)

    let items: Array<Feedback> = []
    let totalCount = 0

    if (response.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items = response.items.map((item: any) => this.modifyFeedback(item))
      totalCount = response.totalCount
    }

    return new ApiList<Feedback>(items, totalCount)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private modifyFeedback(response: any): Feedback {
    return {
      id: response.id,
      createdAt: new Date(response.createdAt),
      status: response.status,
      subject: response.subject,
      message: response.message,
      answer: response.answer ?? '',
      username: response.username ?? '',
    }
  }
}

export function getStatusName(t: ComposerTranslation, status: Status): string {
  const names = {
    [Status.Created]: t('common.created'),
    [Status.InProgress]: t('common.inProgress'),
    [Status.Moderated]: t('common.moderated'),
    [Status.Abort]: t('common.abort'),
    [Status.Closed]: t('common.closed'),
    [Status.Queue]: t('common.inQueue'),
  }

  return names[status]
}
