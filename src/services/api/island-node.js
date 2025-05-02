import HeroClient from "@/api/HeroClient";
import { INDEXED_DB_NAME } from "@/core/storage";
import { isObject } from "@/helpers/core";

const client = new HeroClient();

/**
 * @param {Object} island
 * @param {Boolean} isForce
 * @returns {Promise<Object>}
 */
export async function getNodesMap(island, isForce = false, filter = null) {
  let nodesMap = null;
  const isEmptyFilter = !filter || Object.keys(filter).length === 0;
  const previosUpdatedAt = loadPreviousUpdatedAt(island);
  const isLoadFromServer =
    !previosUpdatedAt || previosUpdatedAt < island.nodesLastUpdatedAt || isForce || !isEmptyFilter;

  try {
    if (!isLoadFromServer) {
      nodesMap = await getNodesFromCache(island);
    }
  } catch (error) {
    console.error(error);
  }

  if (nodesMap === null || nodesMap === undefined) {
    const list = await client.node.getList(island.id, filter);

    nodesMap = {};
    list.items.forEach((node) => {
      nodesMap[node.id] = node;
    });

    if (isEmptyFilter) {
      writeNodesToCache(island, nodesMap);
      savePreviousUpdatedAt(island);
    }
  }

  return nodesMap;
}

const PREVIOUS_DATES_NAME = "island.previosUpdateDates";

export function resetCache() {
  localStorage.setItem(PREVIOUS_DATES_NAME, JSON.stringify({}));
}

/**
 * @param {Object} island
 * @returns Date|null
 */
function loadPreviousUpdatedAt(island) {
  let datesByIsland;

  try {
    datesByIsland = JSON.parse(localStorage.getItem(PREVIOUS_DATES_NAME));
    if (!isObject(datesByIsland)) {
      datesByIsland = {};
    }
  } catch {
    datesByIsland = {};
  }

  const date = datesByIsland[island.id];
  if (date) {
    return new Date(date);
  }

  return null;
}

/**
 * @param {Object} island
 */
function savePreviousUpdatedAt(island) {
  let datesByIsland;

  try {
    datesByIsland = JSON.parse(localStorage.getItem(PREVIOUS_DATES_NAME));
    if (!isObject(datesByIsland)) {
      datesByIsland = {};
    }
  } catch {
    datesByIsland = {};
  }

  datesByIsland[island.id] = new Date().toISOString();

  localStorage.setItem(PREVIOUS_DATES_NAME, JSON.stringify(datesByIsland));
}

/**
 * @param {Object} island
 * @param {Object} nodesMap
 * @returns {Promise}
 */
async function writeNodesToCache(island, nodesMap) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    let transaction = db.transaction("islandNodes", "readwrite");
    let nodeStore = transaction.objectStore("islandNodes");
    let request = nodeStore.put({ islandId: island.id, nodesMap });

    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function () {
      reject(request.error);
    };
  });
}

/**
 * @param {Object} island
 * @returns {Promise|null}
 */
async function getNodesFromCache(island) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    let transaction = db.transaction("islandNodes", "readonly");
    let nodeStore = transaction.objectStore("islandNodes");
    let request = nodeStore.get(island.id);

    request.onsuccess = () => {
      const nodesMap = request.result ? request.result.nodesMap : null;
      resolve(nodesMap);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function openDb() {
  return new Promise((resolve, reject) => {
    const openRequest = window.indexedDB.open(INDEXED_DB_NAME);

    openRequest.onerror = () => {
      reject(openRequest.error);
    };
    openRequest.onsuccess = () => {
      const db = openRequest.result;

      db.onversionchange = () => {
        db.close();
      };

      resolve(db);
    };
    openRequest.onupgradeneeded = (event) => {
      let db = event.target.result;

      if (!db.objectStoreNames.contains("islandNodes")) {
        db.createObjectStore("islandNodes", { keyPath: "islandId", autoIncrement: false });
      }
    };
  });
}
