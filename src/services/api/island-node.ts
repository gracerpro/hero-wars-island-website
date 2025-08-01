import HeroClient from "@/api/HeroClient";
import type { Island } from "@/api/IslandApi";
import type { IslandNodeList, Node, NodeFilter } from "@/api/NodeApi";
import { INDEXED_DB_NAME } from "@/core/storage";
import { isObject } from "@/helpers/core";

type DateByIslandMap = { [key: number]: string }

const client = new HeroClient();

export async function getNodesMap(island: Island, isForce = false, filter?: NodeFilter): Promise<IslandNodeList> {
  let nodesList: IslandNodeList | null = null;
  const isEmptyFilter = filter === undefined || Object.values(filter).every((a) => a === undefined)
  const previosUpdatedAt = loadPreviousUpdatedAt(island);
  const isLoadFromServer =
    !previosUpdatedAt || !island.nodesLastUpdatedAt || previosUpdatedAt < island.nodesLastUpdatedAt || isForce || !isEmptyFilter;

  try {
    if (!isLoadFromServer) {
      nodesList = await getNodesFromCache(island);
    }
  } catch (error) {
    console.error(error); // TODO: notify
  }

  if (nodesList === null || nodesList === undefined) {
    const nodesList = await client.node.byIslandList(island.id, filter);

    if (isEmptyFilter) {
      writeNodesToCache(island, nodesList);
      savePreviousUpdatedAt(island);
    }
  }
  if (nodesList === null || nodesList === undefined) {
    nodesList = {
      nodes: new Map<number, Node>(),
      totalCount: 0,
      rewards: {},
    }
  }

  return nodesList;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNodeList(data: any): boolean {
  return (data.nodes && typeof data.nodes === "object")
    && (typeof data.totalCount === "number")
    && (typeof data.rewards === "object")
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

async function writeNodesToCache(island: Island, nodeList: IslandNodeList): Promise<IDBValidKey | undefined> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("islandNodes", "readwrite");
    const nodeStore = transaction.objectStore("islandNodes");
    const request = nodeStore.put({ islandId: island.id, nodeList });

    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function () {
      reject(request.error);
    };
  });
}

async function getNodesFromCache(island: Island): Promise<IslandNodeList|null> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("islandNodes", "readonly");
    const nodeStore = transaction.objectStore("islandNodes");
    const request = nodeStore.get(island.id);

    request.onsuccess = () => {
      let nodesList = request.result?.nodeList;
      console.log("nodesList from db", nodesList)

      if (!isNodeList(nodesList)) {
        nodesList = null
      }

      resolve(nodesList);
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
