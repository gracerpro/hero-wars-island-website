import HttpError from "@/exceptions/HttpError";
import UserError from "@/exceptions/UserError";

class ApiRequest {
  /**
   * @private
   */
  _locale = null;

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

    let searchParams = null;
    if (params) {
      searchParams = new URLSearchParams(params);
    }
    const response = await fetch(
      import.meta.env.VITE_BACKEND_API_URL +
        url +
        (searchParams ? `?${searchParams}` : ""),
      this.getOptions("GET"),
    );

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
    const response = await fetch(
      import.meta.env.VITE_BACKEND_API_URL + url,
      options,
    );

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
