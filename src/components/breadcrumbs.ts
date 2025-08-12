export interface IBreadcrumbItem {
  label: string
  url?: string
  isActive?: boolean
}

export class BreadcrumbItem implements IBreadcrumbItem {
  label: string
  url: string
  isActive: boolean

  constructor(label: string, url: string, isActive: boolean = false) {
    this.label = label
    this.url = url
    this.isActive = isActive
  }
}

export type Breadcrumbs = Array<BreadcrumbItem>
