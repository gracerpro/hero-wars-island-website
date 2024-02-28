// Pre-render the app into static HTML.

import fs from 'node:fs'
import { getHtml } from './common.js'
import fetch from "node-fetch";
import { loadEnv } from 'vite';

const env = loadEnv("production", process.cwd());

const manifest = JSON.parse(
  fs.readFileSync('./dist/static/.vite/ssr-manifest.json', 'utf-8'),
)
const template = fs.readFileSync('./dist/static/index.html', 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

const dynamicNames = {
  "island": true
};
let urls = [];

const files = fs.readdirSync("./src/views", { withFileTypes: true, recursive: false });

for (let i = 0; i < files.length; ++i) {
  const file = files[i];

  if (!file.isFile()) {
    continue;
  }

  let name = getUrlName(file.name);

  if (dynamicNames[name]) {
    const dynamicUrls = await getDynamicUrls(name);
    dynamicUrls.forEach((url) => {
      console.log(url);
      urls.push(url);
    })
  } else {
    console.log(name);
    urls.push(name === "home" ? "/" : `/${name}`);
  }
}

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
    const { html } = await getHtml(url, manifest, template, render);

    const filePath = `./dist/static${url === '/' ? '/index' : url}.html`
    fs.writeFileSync(filePath, html)

    console.log('pre-rendered:', filePath, "size", html.length);
  }

  // done, delete .vite directory including ssr manifest
  fs.rmSync('./dist/static/.vite', { recursive: true })
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

async function getDynamicUrls(name) {
  if (name === "island") {
    const directory = "./dist/static/islands";
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }

    const pageSize = 100;
    const url = `${env.VITE_BACKEND_API_URL}/islands/?pageSize=${pageSize}`;
    console.log(`fetch ${url}`)
    const response = await fetch(url);
    const list = await response.json();
    console.log(`ok, ${list.totalCount}`)

    if (list.totalCount > pageSize) {
      throw new Error("The total page size more than limit.");
    }

    return list.items.map((island) => `/islands/${island.id}`);
  }

  throw new Error(`Unknown dynamic name ${name}!`);
}
