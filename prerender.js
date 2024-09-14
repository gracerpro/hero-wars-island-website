// Pre-render the app into static HTML.

import fs from 'node:fs'
import { getHtml } from './common.js'
import fetch from "node-fetch";
import { loadEnv } from 'vite';

const envName = process.env.NODE_ENV ? process.env.NODE_ENV : "production"
const env = loadEnv(envName, process.cwd());
const manifest = JSON.parse(
  fs.readFileSync('./dist/static/.vite/ssr-manifest.json', 'utf-8'),
)
const template = fs.readFileSync('./dist/static/index.html', 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

const NAME_ISLAND = "island";
const NAME_NEWS_VIEW = "news-view";

const enLocale = "en";

initDirectories();
const urls = await readUrlsFromView();
await createFiles(urls);

// done, delete .vite directory including ssr manifest
fs.rmSync('./dist/static/.vite', { recursive: true })


/////////////////////////////////////////////////////

/**
 * @param {String[]} urls
 */
async function createFiles(urls) {
  console.log("Create a files...")

  const enUrl = `/${enLocale}`;
  const basePath = "./dist/static"
  console.log("base path", basePath);

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
    const pathName = path + ".html"
    const filePath = basePath + pathName
    fs.writeFileSync(filePath, html)

    console.log('pre-rendered:', pathName, "size", html.length);
  }
}

/**
 * @returns {Promise<String[]>}
 */
async function readUrlsFromView() {
  console.log("Read urls from view...");

  const dynamicNamesMap = {
    [NAME_ISLAND]: true,
    [NAME_NEWS_VIEW]: true,
  };
  let urls = [];
  const files = fs.readdirSync("./src/views", { withFileTypes: true, recursive: false });

  for (let i = 0; i < files.length; ++i) {
    const file = files[i];

    if (!file.isFile()) {
      continue;
    }

    let name = getUrlName(file.name);

    if (dynamicNamesMap[name]) {
      console.log(`- dynamic name! "${name}", get names...`)
      const names = await getDynamicNames(name);
      console.log("found", names.length)

      names.forEach((dynamicName) => {
        console.log("--", dynamicName);
        urls.push(`/${dynamicName}`);
        urls.push(`/${enLocale}/${dynamicName}`);
      })
    } else {
      console.log("-", name);
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
      console.log("-", name);

      urls.push(`/${name}`);
    })

  return urls;
}

function initDirectories() {
  console.log("Init directories...")

  const basePath = "./dist/static/"
  const directories = [
    enLocale,
    "islands",
    enLocale + "/islands",
    "news",
    enLocale + "/news"
  ];

  directories.forEach((path) => {
    console.log("- ", path);
    const directory = basePath + path;
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
  })
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

/**
 * @param {String} name 
 * @returns {Promise<String[]>}
 */
async function getDynamicNames(name) {
  const pageSize = 50;

  if (name === NAME_ISLAND) {
    return await loadListNames(
      loadIslands,
      pageSize,
      (island) => `islands/${island.id}`
    )
  }
  if (name === NAME_NEWS_VIEW) {
    return await loadListNames(
      loadNews,
      pageSize,
      (oneNews) => `news/${oneNews.slug}`
    )
  }

  throw new Error(`Unknown dynamic name ${name}!`);
}

/**
 * @param {Function} loadItems
 * @param {Number} pageSize
 * @param {Function} modifyItem
 * @returns {Promise<String[]>}
 */
async function loadListNames(loadItems, pageSize, modifyItem) {
  let resultNames = [];
  const maxIteration = 50;

  for (let pageNumber = 1; ; ++pageNumber) {
    console.log(`load items by number ${pageNumber} and size ${pageSize}...`)
    const list = await loadItems(pageNumber, pageSize);
    console.log(`ok, items size ${list.items.length}`)

    if (!list.items.length) {
      break;
    }

    const names = list.items.map(modifyItem)
    resultNames.push(...names)

    if (pageNumber * pageSize >= list.totalCount) {
      break;
    }
    if (pageNumber > maxIteration) {
      break;
    }
  }

  return resultNames;
}

/**
 * @param {Number} pageNumber
 * @param {Number} pageSize
 * @returns {Promise<Object>}
 */
async function loadIslands(pageNumber, pageSize = 100) {
  const url = `${env.VITE_BACKEND_API_URL}/islands/?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  console.log("fetch", url)
  const response = await fetch(url);
  const list = await response.json();

  return list;
}

/**
 * @param {Number} pageNumber
 * @param {Number} pageSize
 * @returns {Promise<Object>}
 */
async function loadNews(pageNumber, pageSize = 50) {
  const url = `${env.VITE_BACKEND_API_URL}/news/?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  console.log("fetch", url)
  const response = await fetch(url);
  const list = await response.json();

  return list;
}
