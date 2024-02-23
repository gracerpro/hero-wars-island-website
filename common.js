/**
 * @param {String} url
 * @param {Object} manifest
 * @param {String} template
 * @param {Function} render
 * @returns {String}
 */
export async function getHtml(url, manifest, template, render) {
  // 4. render the app HTML. This assumes entry-server.js's exported
  //     `render` function calls appropriate framework SSR APIs,
  //    e.g. ReactDOMServer.renderToString()
  const rendered = await render(url, manifest)

  // 5. Inject the app-rendered HTML into the template.
  let html = template
    .replace(`<!--preload-links-->`, rendered.preloadLinks ?? '')
    .replace(`<!--app-html-->`, rendered.html ?? '');

  const title = rendered.page.title
    ? rendered.page.title
    : "Хроники хаоса Эра доминиона карта острова";
  html = html.replace("<!--page-title-->", title);

  const description = rendered?.page.description
    ? rendered?.page.description
    : "Игра Хроники Хаоса, карта острова, соберем все призы вместе!";
  html = html.replace("<!--page-description-->", description);

  const keywords = rendered?.page.keywords
    ? rendered?.page.keywords
    : "Хроники хаоса, Эра доминиона, карта острова, карта, открытая карта, призы, ресурсы";
  html = html.replace("<!--page-keywords-->", keywords);

  return html;
}
