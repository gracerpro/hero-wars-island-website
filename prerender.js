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

const enLocale = "en";
const dynamicNamesMap = {
  "island": true
};
const urls = await getUrls(dynamicNamesMap);

initDirectories();

await createFiles(urls);

// done, delete .vite directory including ssr manifest
fs.rmSync('./dist/static/.vite', { recursive: true })


/////////////////////////////////////////////////////

/**
 * @param {String[]} urls
 */
async function createFiles(urls) {
  const enUrl = `/${enLocale}`;

  for (const url of urls) {
    const { html } = await getHtml(url, manifest, template, render);

    let path;

    if (url === "/") {
      path = "/index";
    } else if (url === enUrl) {
      path = `${enUrl}/index`;
    } else {
      path = url;
    }
    const filePath = `./dist/static${path}.html`
    fs.writeFileSync(filePath, html)

    console.log('pre-rendered:', filePath, "size", html.length);
  }
}

/**
 * @param {Object} dynamicNamesMap
 * @returns {String[]}
 */
async function getUrls(dynamicNamesMap) {
  let urls = [];

  const files = fs.readdirSync("./src/views", { withFileTypes: true, recursive: false });

  for (let i = 0; i < files.length; ++i) {
    const file = files[i];

    if (!file.isFile()) {
      continue;
    }

    let name = getUrlName(file.name);

    if (dynamicNamesMap[name]) {
      const list = await getDynamicNames(name);
      list.forEach((dynamicName) => {
        console.log(dynamicName);
        urls.push(`/${dynamicName}`);
        urls.push(`/${enLocale}/${dynamicName}`);
      })
    } else {
      console.log(name);
      if (name === "home") {
        urls.push("/");
        urls.push(`/${enLocale}`);
      } else {
        urls.push(`/${name}`);
        urls.push(`/${enLocale}/${name}`);
      }
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

  return urls;
}

function initDirectories() {
  const enDirectory = `./dist/static/${enLocale}`;
  if (!fs.existsSync(enDirectory)) {
    fs.mkdirSync(enDirectory);
  }
  const islandsDirectory = "./dist/static/islands";
  if (!fs.existsSync(islandsDirectory)) {
    fs.mkdirSync(islandsDirectory);
  }
  const enIslandsDirectory = `./dist/static/${enLocale}/islands`;
  if (!fs.existsSync(enIslandsDirectory)) {
    fs.mkdirSync(enIslandsDirectory);
  }
}

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

async function getDynamicNames(name) {
  if (name === "island") {
    const pageSize = 100;
    const url = `${env.VITE_BACKEND_API_URL}/islands/?pageSize=${pageSize}`;
    console.log(`fetch ${url}`)
    const response = await fetch(url);
    const list = await response.json();
    console.log(`ok, ${list.totalCount}`)

    if (list.totalCount > pageSize) {
      throw new Error("The total page size more than limit.");
    }

    return list.items.map((island) => `islands/${island.id}`);
  }

  throw new Error(`Unknown dynamic name ${name}!`);
}
