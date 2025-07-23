import { getCurrentLocale } from "@/i18n/translation";
import ApiRequest from "../core/ApiRequest";
import { ApiList } from "./common";

interface Image {
  url: string,
  width: number,
  height: number,
  size: number,
}

interface Region {
  number: number,
  startAt: Date | null,
  isVisible: boolean,
}

export interface Island {
  id: number,
  eventStartAt: Date,
  eventEndAt: Date,
  name: string,
  description?: string,
  initMap: {
    scale: number,
    offsetX: number,
    offsetY: number,
  },
  nodesLastUpdatedAt?: Date | null,
  syncGameVersion: string | null,
  syncAt: Date | null,
  backgroundImage: Image | null,
  pageTitle?: string,
  pageDescription?: string,
  pageKeywords?: string,
  regions: Array<Region>,
}

export class DataParams {
  readonly isWithDescription: boolean
  readonly isWithBackgroundImage: boolean

  constructor(
    isWithDescription: boolean = false,
    isWithBackgroundImage: boolean = false,
  ) {
    this.isWithDescription = isWithDescription
    this.isWithBackgroundImage = isWithBackgroundImage
  }
}

export class IslandApi {
  apiRequest: ApiRequest

  constructor() {
    this.apiRequest = new ApiRequest();
    this.apiRequest.setBeforeRequest((request) => {
      request.setLocale(getCurrentLocale());
    });
  }

  async get(id: number, dataParams: DataParams): Promise<Island | null> {
    const params = new URLSearchParams()

    if (dataParams.isWithDescription) {
      params.append("isWithDescription", "1");
    }
    if (dataParams.isWithBackgroundImage) {
      params.append("isWithBackgroundImage", "1");
    }
    const response = await this.apiRequest.get("/islands/" + id, params);
    let island = null

    if (response) {
      island = this.modifyIsland(response);
    }

    return island;
  }

  /**
   * @returns {Promise<Object|null>}
   */
  async getActual() {
    const params = new URLSearchParams()
    params.append("isWithSeo", "0")
    params.append("isWithDescription", "0")

    const response = await this.apiRequest.get("/islands/actual", params);
    let island = null

    if (response) {
      island = this.modifyIsland(response);
    }

    return island;
  }

  async getList(pageSize: number, pageNumber: number = 1): Promise<ApiList<Island>> {
    const params = new URLSearchParams()
    params.append("pageSize", pageSize.toString())
    params.append("fields[isWithDescription]", "0")
    params.append("fields[isWithSeo]", "0")

    if (pageNumber > 1) {
      params.append("pageNumber", pageNumber.toString());
    }

    const response = await this.apiRequest.get("/islands", params);

    let items: Array<Island> = []
    let totalCount = 0

    if (response.items) {
      items = response.items.map((island: any) => this.modifyIsland(island));
      totalCount = response.totalCount
    }

    return new ApiList<Island>(items, totalCount);
  }

  private modifyIsland(response: any): Island {
    let regions: Array<Region> = []
    let image: Image | null = null

    if (response.regions) {
      regions = response.regions.map((data: any) => {
        return {
          startAt: data.startAt ? new Date(data.startAt) : null,
        }
      });
    }
    if (response.backgroundImage) {
      image = {
        url: response.backgroundImage.url,
        width: response.backgroundImage.width,
        height: response.backgroundImage.height,
        size: response.backgroundImage.size,
      }
    }

    return {
      id: response.id,
      eventStartAt: new Date(response.eventStartAt),
      eventEndAt: new Date(response.eventEndAt),
      name: response.name,
      nodesLastUpdatedAt: response.nodesLastUpdatedAt ? new Date(response.nodesLastUpdatedAt) : null,
      regions,
      initMap: {
        scale: response.initMap.scale,
        offsetX: response.initMap.offsetX,
        offsetY: response.initMap.offsetY,
      },
      syncGameVersion: response.syncGameVersion ?? null,
      syncAt: response.syncAt ?? null,
      backgroundImage: image,
    }
  }
}
