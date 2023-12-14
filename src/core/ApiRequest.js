import HttpError from "@/exceptions/HttpError";
import UserError from "@/exceptions/UserError";

class ApiRequest {
  /**
   * @return {Promise<Object|Array>}
   * @param {String} url
   */
  async get(url) {
    const options = {
      method: "GET",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json",
      },
    };
    const response = await fetch(
      process.env.VUE_APP_BACKEND_API_URL + url,
      options
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
    const options = {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      process.env.VUE_APP_EXTERNAL_API_URL + url,
      options
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
}

export default ApiRequest;
