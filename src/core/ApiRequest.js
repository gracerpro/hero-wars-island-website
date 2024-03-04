import HttpError from "@/exceptions/HttpError";
import UserError from "@/exceptions/UserError";

let fetch;

if (import.meta.env.SSR) {
  fetch = (...args) => import("node-fetch").then(({ default: _fetch }) => _fetch(...args));
} else {
  fetch = window.fetch;
}

class ApiRequest {
  /**
   * @private
   */
  _locale = null;

  /**
   * @private
   */
  _backendUrl = import.meta.env.VITE_BACKEND_API_URL;

  _beforeRequest = (/* request */) => {};

  /**
   * @param {String} locale
   */
  setLocale(locale) {
    this._locale = locale;
  }

  /**
   * @param {Function} callable
   */
  setBeforeRequest(callable) {
    this._beforeRequest = callable;
  }

  /**
   * @return {Promise<Object|Array>}
   * @param {String} url
   * @param {Object} params
   */
  async get(url, params) {
    if (this._beforeRequest) {
      this._beforeRequest(this);
    }

    let searchParams = "";
    if (params) {
      searchParams = "?" + new URLSearchParams(params).toString();
    }
    const response = await fetch(this._backendUrl + url + searchParams, this.getOptions("GET"));

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

  /**
   * @param {String} url
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async post(url, data) {
    if (this._beforeRequest) {
      this._beforeRequest(this);
    }

    const options = {
      ...this.getOptions("POST"),
      body: JSON.stringify(data),
    };
    const response = await fetch(this._backendUrl + url, options);

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

  /**
   * @private
   * @param {String} method
   */
  getOptions(method) {
    const options = {
      method,
      redirect: "follow",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json",
      },
    };
    if (this._locale) {
      options.headers["Accept-Language"] = this._locale;
    }

    return options;
  }
}

export default ApiRequest;
