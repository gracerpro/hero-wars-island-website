// Pre-render the app into static HTML.
// run `npm run generate` and then `dist/static` can be served as a static site.

import fs from 'node:fs'

const manifest = JSON.parse(
  fs.readFileSync('./dist/static/.vite/ssr-manifest.json', 'utf-8'),
)
const template = fs.readFileSync('./dist/static/index.html', 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

let urls = [];
fs.readdirSync("./src/views", { withFileTypes: true, recursive: false })
  .forEach((file) => {
    if (!file.isFile()) {
      return;
    }

    let name = file.name.toLowerCase();
    name = name.substring(3); // remove "the"
    name = name.substring(0, name.length - 4); // remove ".vue"

    urls.push(name === "home" ? "/" : `/${name}`);
  })

;(async () => {
  for (const url of urls) {
    const { html: templateHtml, preloadLinks } = await render(url, manifest)

    const html = template
      .replace(`<!--preload-links-->`, preloadLinks)
      .replace(`<!--app-html-->`, templateHtml)

    const filePath = `./dist/static${url === '/' ? '/index' : url}.html`
    fs.writeFileSync(filePath, html)

    console.log('pre-rendered:', filePath, "size", html.length);
  }

  // done, delete .vite directory including ssr manifest
  fs.rmSync('./dist/static/.vite', { recursive: true })
})()
