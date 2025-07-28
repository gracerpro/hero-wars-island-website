import HeroClient from "@/api/HeroClient";
import type { Island } from "@/api/IslandApi";
import type { Node, NodeFilter } from "@/api/NodeApi";
import { INDEXED_DB_NAME } from "@/core/storage";
import { isObject } from "@/helpers/core";
import type { NodeMap } from "@/views/island/map";

type DateByIslandMap = { [key: number]: string }

const client = new HeroClient();

export async function getNodesMap(island: Island, isForce = false, filter?: NodeFilter): Promise<NodeMap> {
  let nodesMap: NodeMap | null = null;
  const isEmptyFilter = filter === undefined || Object.values(filter).every((a) => a === undefined)
  const previosUpdatedAt = loadPreviousUpdatedAt(island);
  const isLoadFromServer =
    !previosUpdatedAt || !island.nodesLastUpdatedAt || previosUpdatedAt < island.nodesLastUpdatedAt || isForce || !isEmptyFilter;

  try {
    if (!isLoadFromServer) {
      nodesMap = await getNodesFromCache(island);
      console.log("from cache nodesMap", nodesMap); // TODO: test
      if (!(nodesMap instanceof Map)) {
        nodesMap = null
      }
    }
  } catch (error) {
    console.error(error); // TODO: notify
  }

  if (nodesMap === null || nodesMap === undefined) {
    const list = await client.node.getList(island.id, filter);

    nodesMap = new Map<number, Node>()
    list.items.forEach((node: Node) => {
      nodesMap!.set(node.id, node)
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

function loadPreviousUpdatedAt(island: Island): Date | null {
  let datesByIsland: DateByIslandMap = {};

  try {
    datesByIsland = JSON.parse(localStorage.getItem(PREVIOUS_DATES_NAME) ?? "");
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

function savePreviousUpdatedAt(island: Island) {
  let datesByIsland: DateByIslandMap = {};

  try {
    const item = localStorage.getItem(PREVIOUS_DATES_NAME)

    if (item !== null) {
      datesByIsland = JSON.parse(item);

      if (!isObject(datesByIsland)) {
        datesByIsland = {};
      }
    }
  } catch {
    datesByIsland = {};
  }

  datesByIsland[island.id] = new Date().toISOString();

  localStorage.setItem(PREVIOUS_DATES_NAME, JSON.stringify(datesByIsland));
}

async function writeNodesToCache(island: Island, nodesMap: NodeMap): Promise<IDBValidKey | undefined> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("islandNodes", "readwrite");
    const nodeStore = transaction.objectStore("islandNodes");
    const request = nodeStore.put({ islandId: island.id, nodesMap });

    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function () {
      reject(request.error);
    };
  });
}

async function getNodesFromCache(island: Island): Promise<NodeMap|null> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("islandNodes", "readonly");
    const nodeStore = transaction.objectStore("islandNodes");
    const request = nodeStore.get(island.id);

    request.onsuccess = () => {
      const nodesMap = request.result?.nodesMap;
      resolve(nodesMap);
    }
    request.onerror = () => {
      reject(request.error);
    }
  })
}

async function openDb(): Promise<IDBDatabase> {
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
    openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBRequest).result as IDBDatabase;

      if (!db.objectStoreNames.contains("islandNodes")) {
        db.createObjectStore("islandNodes", { keyPath: "islandId", autoIncrement: false });
      }
    };
  });
}
