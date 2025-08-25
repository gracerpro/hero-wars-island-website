import { HttpError } from '@/exceptions/HttpError'
import { UserError } from '@/exceptions/UserError'
import { isObject } from '@/helpers/core'

type BeforeRequestCallback = (request: ApiRequest) => void

interface AppResponse {
  status: number
  ok: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: () => Promise<any>
}

interface AppRequestInit {
  method: string
  redirect: RequestRedirect
  headers: Headers
}

interface ErrorResponse {
  isClientSafe?: boolean
  message?: string
}

class ApiRequest {
  private readonly backendUrl: string = import.meta.env.VITE_BACKEND_API_URL

  private locale: string = ''

  private beforeRequest: BeforeRequestCallback | null = null

  setLocale(locale: string) {
    this.locale = locale
  }

  setBeforeRequest(callable: BeforeRequestCallback) {
    this.beforeRequest = callable
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(url: string, params?: URLSearchParams): Promise<any> {
    if (this.beforeRequest !== null) {
      this.beforeRequest(this)
    }

    let queryParams = ''

    if (params) {
      queryParams = '?' + params.toString()
    }
    const response = await this.fetch(this.backendUrl + url + queryParams, this.getOptions('GET'))

    if (!response.ok) {
      if (response.status >= 400) {
        let data = (await response.json()) as ErrorResponse

        if (!isObject(data)) {
          data = {}
        }

        const message = data.message ?? 'Http error ' + response.status

        if (data.isClientSafe) {
          throw new UserError(message)
        } else {
          throw new HttpError(response.status, message)
        }
      }
      // no conection?
      throw new Error('Server return a not success response.')
    }

    return response.json()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post(url: string, data: object): Promise<any> {
    if (this.beforeRequest !== null) {
      this.beforeRequest(this)
    }

    const options = {
      ...this.getOptions('POST'),
      body: JSON.stringify(data),
    }
    const response = await this.fetch(this.backendUrl + url, options)

    if (!response.ok) {
      if (response.status >= 400) {
        let data = (await response.json()) as ErrorResponse

        if (!isObject(data)) {
          data = {}
        }
        const message = data.message ?? 'Http error ' + response.status

        if (data.isClientSafe) {
          throw new UserError(message)
        } else {
          throw new HttpError(response.status, message)
        }
      }
      // no conection?
      throw new Error('Server return a not success response.')
    }

    return response.json()
  }

  private getOptions(method: string): AppRequestInit {
    const headers = new Headers({
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: 'application/json',
    })

    if (this.locale !== '') {
      headers.set('Accept-Language', this.locale)
    }

    return {
      method,
      redirect: 'follow',
      headers,
    }
  }

  private async fetch(url: string, init?: AppRequestInit): Promise<AppResponse> {
    let result: AppResponse

    if (import.meta.env.SSR) {
      const fetchModule = await import('node-fetch')
      result = (await fetchModule.default(url, init)) as AppResponse
    } else {
      result = (await window.fetch(url, init)) as AppResponse
    }

    return result
  }
}

export default ApiRequest
