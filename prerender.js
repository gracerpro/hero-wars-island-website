// Pre-render the app into static HTML.

import fs from 'node:fs'
import { getHtml } from './common.js'

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

    let name = file.name;
    name = name.substring(3); // remove "the"
    name = name.substring(0, name.length - 4); // remove ".vue"
    name = camelToKebab(name);
    console.log(name);

    urls.push(name === "home" ? "/" : `/${name}`);
  })

fs.readdirSync("./src/views/status-pages", { withFileTypes: true, recursive: false })
  .forEach((file) => {
    if (!file.isFile()) {
      return;
    }

    let name = file.name;
    name = name.substring(3); // remove "the"
    name = name.substring(0, name.length - 4); // remove ".vue"
    name = camelToKebab(name);
    console.log(name);

    urls.push(`/${name}`);
  })

;(async () => {
  for (const url of urls) {
    const resultHtml = await getHtml(url, manifest, template, render);

    const filePath = `./dist/static${url === '/' ? '/index' : url}.html`
    fs.writeFileSync(filePath, resultHtml)

    console.log('pre-rendered:', filePath, "size", resultHtml.length);
  }

  // done, delete .vite directory including ssr manifest
  fs.rmSync('./dist/static/.vite', { recursive: true })
})()

function camelToKebab(text) {
  return text.split('').map((letter, i) => {
    return letter.toUpperCase() === letter
     ? `${i !== 0 ? '-' : ''}${letter.toLowerCase()}`
     : letter;
  }).join('');
}
