import HttpError from "@/exceptions/HttpError";
import UserError from "@/exceptions/UserError";

let fetch;

if (import.meta.env.SSR) {
  fetch = (...args) => import("node-fetch").then(({ default: _fetch }) => _fetch(...args));
} else {
  fetch = window.fetch;
}

type BeforeRequestCallback = (request: ApiRequest) => void;

class ApiRequest {
  private readonly backendUrl = import.meta.env.VITE_BACKEND_API_URL;

  private locale: string = "";

  private beforeRequest: BeforeRequestCallback | null = null

  setLocale(locale: string) {
    this.locale = locale;
  }

  setBeforeRequest(callable: BeforeRequestCallback) {
    this.beforeRequest = callable;
  }

  async get(url: string, params: object) {
    if (this.beforeRequest !== null) {
      this.beforeRequest(this);
    }

    let searchParams = "";

    if (params) {
      searchParams = "?" + new URLSearchParams(params).toString();
    }
    const response = await fetch(this.backendUrl + url + searchParams, this.getOptions("GET"));

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

    return await response.json();
  }

  async post(url: string, data: object) {
    if (this.beforeRequest !== null) {
      this.beforeRequest(this);
    }

    const options = {
      ...this.getOptions("POST"),
      body: JSON.stringify(data),
    };
    const response = await fetch(this.backendUrl + url, options);

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

    return await response.json();
  }

  private getOptions(method: string) {
    const options = {
      method,
      redirect: "follow",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json",
      },
    }
    if (this.locale !== "") {
      options.headers["Accept-Language"] = this.locale;
    }

    return options;
  }
}

export default ApiRequest;
