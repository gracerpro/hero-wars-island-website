export type AppSsrManifest = { [key: string]: Array<string> }

export type HtmlResult = {
  html: string
  statusCode: number
}

interface PageInfo {
  title?: string
  description?: string
  keywords?: string
}

export interface RenderResult {
  html: string
  preloadLinks?: string
  page: PageInfo | null
  statusCode: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any
}

export type RenderFun = (url: string, ssrManifest?: AppSsrManifest) => Promise<RenderResult>

export interface RenderParams {
  url: string
  template: string
  render: RenderFun
  manifest?: AppSsrManifest
}

export async function getHtml(params: RenderParams): Promise<HtmlResult> {
  // 4. render the app HTML. This assumes entry-server.js's exported
  //     `render` function calls appropriate framework SSR APIs,
  //    e.g. ReactDOMServer.renderToString()
  const rendered = await params.render(params.url, params.manifest)

  // 5. Inject the app-rendered HTML into the template.
  let html = params.template
    .replace(`<!--preload-links-->`, rendered.preloadLinks ?? '')
    .replace(`<!--app-html-->`, rendered.html ?? '')

  const title = rendered.page?.title
    ? rendered.page.title
    : 'Хроники хаоса Эра доминиона карта острова'
  html = html.replace('<!--page-title-->', title)

  const description = rendered.page?.description
    ? rendered?.page.description
    : 'Игра Хроники Хаоса, карта острова, соберем все призы вместе!'
  html = html.replace('<!--page-description-->', description)

  const keywords = rendered.page?.keywords
    ? rendered?.page.keywords
    : 'Хроники хаоса, Эра доминиона, карта острова, карта, открытая карта, призы, ресурсы'
  html = html.replace('<!--page-keywords-->', keywords)

  html = html.replace(
    '/*** initial-state-json ***/',
    rendered.state ? "window.__INITIAL_STATE__ = '" + JSON.stringify(rendered.state) + "'" : ''
  )

  return {
    html,
    statusCode: rendered.statusCode,
  }
}
