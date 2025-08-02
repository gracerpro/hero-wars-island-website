// Pre-render the app into static HTML.

import fs from 'node:fs'
import { getHtml } from './src/server-common.js'
import fetch from "node-fetch";
import { loadEnv } from 'vite';
import { gzip } from 'node-gzip';

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

interface LoadItemsResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: Array<any>,
  totalCount: number,
}

type LoadItemsFun = (pageNumber: number, pageSize: number) => Promise<LoadItemsResult>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModifyItemFun = (item: any) => string

/**
 * @param {String[]} urls
 */
async function createFiles(urls: Array<string>) {
  console.log("Create a files...")

  const enUrl = `/${enLocale}`;
  const basePath = "./dist/static"
  console.log("base path", basePath);

  for (const url of urls) {
    const { html } = await getHtml({
      url,
      manifest,
      template,
      render
    });

    let path: string

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
    const compressedHtml = await gzip(html)
    fs.writeFileSync(filePath + '.gz', compressedHtml);

    console.log('pre-rendered:', pathName, "size", html.length);
  }
}

async function readUrlsFromView(): Promise<Array<string>> {
  console.log("Read urls from view...");

  const dynamicNamesMap = {
    [NAME_ISLAND]: true,
    [NAME_NEWS_VIEW]: true,
  };
  const urls = [];
  const files = fs.readdirSync("./src/views", { withFileTypes: true, recursive: false });

  for (let i = 0; i < files.length; ++i) {
    const file = files[i];

    if (!file.isFile()) {
      continue;
    }

    const name = getUrlName(file.name);

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

      const name = getUrlName(file.name);
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

function getUrlName(fileName: string): string {
  let name = fileName.substring(3); // remove "the"
  name = name.substring(0, name.length - 4); // remove ".vue"
  name = camelToKebab(name);
  
  return name;
}

function camelToKebab(text: string): string {
  return text.split('').map((letter, i) => {
    return letter.toUpperCase() === letter
     ? `${i !== 0 ? '-' : ''}${letter.toLowerCase()}`
     : letter;
  }).join('');
}

async function getDynamicNames(name: string): Promise<Array<string>> {
  const pageSize = 50;

  if (name === NAME_ISLAND) {
    return await loadListNames(
      loadIslands,
      pageSize,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (island: any) => `islands/${island.id}`
    )
  }
  if (name === NAME_NEWS_VIEW) {
    return await loadListNames(
      loadNews,
      pageSize,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (oneNews: any) => `news/${oneNews.slug}`
    )
  }

  throw new Error(`Unknown dynamic name ${name}!`);
}

async function loadListNames(
  loadItems: LoadItemsFun,
  pageSize: number,
  modifyItemFun: ModifyItemFun
): Promise<Array<string>> {
  const resultNames = [];
  const maxIteration = 50;

  for (let pageNumber = 1; ; ++pageNumber) {
    console.log(`load items by number ${pageNumber} and size ${pageSize}...`)
    const list = await loadItems(pageNumber, pageSize);
    console.log(`ok, items size ${list.items.length}`)

    if (!list.items.length) {
      break;
    }

    const names = list.items.map(modifyItemFun)
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

async function loadIslands(pageNumber: number, pageSize = 100): Promise<LoadItemsResult> {
  const url = `${env.VITE_BACKEND_API_URL}/islands/?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  console.log("fetch", url)
  const response = await fetch(url);
  const list = await response.json();

  return list as LoadItemsResult;
}

async function loadNews(pageNumber: number, pageSize = 50): Promise<LoadItemsResult> {
  const url = `${env.VITE_BACKEND_API_URL}/news/?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  console.log("fetch", url)
  const response = await fetch(url);
  const list = await response.json();

  return list as LoadItemsResult;
}
