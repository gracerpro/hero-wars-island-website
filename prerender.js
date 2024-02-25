// Pre-render the app into static HTML.

import fs from 'node:fs'
import { getHtml } from './common.js'

const manifest = JSON.parse(
  fs.readFileSync('./dist/static/.vite/ssr-manifest.json', 'utf-8'),
)
const template = fs.readFileSync('./dist/static/index.html', 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

const dynamicNames = {
  "island": true
};

let urls = [];
fs.readdirSync("./src/views", { withFileTypes: true, recursive: false })
  .forEach((file) => {
    if (!file.isFile()) {
      return;
    }

    let name = getUrlName(file.name);

    if (dynamicNames[name]) {
      getDynamicUrls(name).forEach((url) => {
        console.log(url);
        urls.push(url);
      })
    } else {
      console.log(name);
      urls.push(name === "home" ? "/" : `/${name}`);
    }
  })

fs.readdirSync("./src/views/status-pages", { withFileTypes: true, recursive: false })
  .forEach((file) => {
    if (!file.isFile()) {
      return;
    }

    let name = getUrlName(file.name);
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
  //fs.rmSync('./dist/static/.vite', { recursive: true })
})()

function getUrlName(fileName) {
  let name = fileName;
  name = name.substring(3); // remove "the"
  name = name.substring(0, name.length - 4); // remove ".vue"
  name = camelToKebab(name);
  
  return name;
}

function camelToKebab(text) {
  return text.split('').map((letter, i) => {
    return letter.toUpperCase() === letter
     ? `${i !== 0 ? '-' : ''}${letter.toLowerCase()}`
     : letter;
  }).join('');
}

function getDynamicUrls(name) {
  if (name === "island") {
    const directory = "./dist/static/islands";
    if (!fs.existsSync(directory)) {
      console.log("NOT EXISTS", directory);
      fs.mkdirSync(directory);
    }

    // TOOD: this is HACK, get data from production server
    return [1, 2].map((id) => `/islands/${id}`);
  }

  throw new Error(`Unknown dynamic name ${name}!`);
}
