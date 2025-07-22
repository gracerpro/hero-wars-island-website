import { HttpError } from "@/exceptions/HttpError";
import { UserError } from "@/exceptions/UserError";

type BeforeRequestCallback = (request: ApiRequest) => void;

class ApiRequest {
  private readonly backendUrl: string = import.meta.env.VITE_BACKEND_API_URL;

  private locale: string = "";

  private beforeRequest: BeforeRequestCallback | null = null

  setLocale(locale: string) {
    this.locale = locale;
  }

  setBeforeRequest(callable: BeforeRequestCallback) {
    this.beforeRequest = callable;
  }

  async get(url: string, params?: URLSearchParams): Promise<any> {
    if (this.beforeRequest !== null) {
      this.beforeRequest(this);
    }

    let searchParams = "";

    if (params !== undefined) {
      searchParams = "?" + params.toString();
    }
    const response = await this.fetch(this.backendUrl + url + searchParams, this.getOptions("GET"));

    if (!response.ok) {
      if (response.status >= 400) {
        const data = await response.json();
        const message = typeof data === "object" ? data.message : null;

        if (data.isClientSafe) {
          throw new UserError(message);
        } else {
          throw new HttpError(response.status, message);
        }
      }
      // no conection?
      throw new Error("Server return a not success response.");
    }

    return response.json();
  }

  async post(url: string, data: object): Promise<any> {
    if (this.beforeRequest !== null) {
      this.beforeRequest(this);
    }

    const options = {
      ...this.getOptions("POST"),
      body: JSON.stringify(data),
    };
    const response = await this.fetch(this.backendUrl + url, options);

    if (!response.ok) {
      if (response.status >= 400) {
        const data = await response.json();
        const message = typeof data === "object" ? data.message : null;

        if (data.isClientSafe) {
          throw new UserError(message);
        } else {
          throw new HttpError(response.status, message);
        }
      }
      // no conection?
      throw new Error("Server return a not success response.");
    }

    return response.json();
  }

  private getOptions(method: string): RequestInit {
    const headers = new Headers({
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json",
    })

    if (this.locale !== "") {
      headers.set("Accept-Language", this.locale);
    }

    return {
      method,
      redirect: "follow",
      headers,
    }
  }

  private async fetch(url: string, init?: RequestInit): Promise<Response> {
    let result: Response

    if (import.meta.env.SSR) {
      // const fetchModule = await import('node-fetch')
      // result = await fetchModule.default(url, init)
      throw new Error("TODO: fetch on server")
    } else {
      result = await window.fetch(url, init);
    }

    return result
  }
}

export default ApiRequest;
