import HeroClient from "@/api/HeroClient";

const client = new HeroClient();

/**
 * @param {Object} island
 * @returns {Promise<Object>}
 */
export async function getNodes(island) {
  let nodes = await getNodesFromCache(island);

  console.log("from cache", nodes);

  if (nodes === null || nodes === undefined) {
    nodes = {};
    const list = await client.getNodes(island.id);
    list.items.forEach((node) => {
      nodes[node.id] = node;
    });

    writeNodesToCache(island, nodes);
  }

  return nodes;
}

async function writeNodesToCache(island, nodes) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    let transaction = db.transaction("islandNodes", "readwrite");
    let nodeStore = transaction.objectStore("islandNodes");
    let request = nodeStore.put({islandId: island.id, nodes});

    request.onsuccess = function() {
      resolve(request.result);
    }
    request.onerror = function() {
      reject(request.error);
    }
  });
}

async function getNodesFromCache(island) {
  let previosUpdatedAt = null;

  previosUpdatedAt = new Date();

  if (!previosUpdatedAt || previosUpdatedAt < island.nodesLastUpdatedAt) {
    return null;
  }

  console.log(island.nodesLastUpdatedAt, previosUpdatedAt, previosUpdatedAt < island.nodesLastUpdatedAt);

  const db = await openDb();

  return new Promise((resolve, reject) => {
    let transaction = db.transaction("islandNodes", "readonly");
    let nodeStore = transaction.objectStore("islandNodes");
    let request = nodeStore.get(island.id);

    request.onsuccess = function() {
      const nodes = request.result ? request.result.nodes : null;
      resolve(nodes);
    }
    request.onerror = function() {
      reject(request.error);
    }
  });
}

async function openDb() {
  return new Promise((resolve, reject) => {
    const openRequest = window.indexedDB.open("app");

    openRequest.onerror = function() {
      reject(openRequest.error);
    };
    openRequest.onsuccess = function() {
      resolve(openRequest.result);
    };
    openRequest.onupgradeneeded = function(event) {
      console.log("onupgradeneeded", event);
      let db = event.target.result;
      console.log(db, event.oldVersion);
  
      switch(event.oldVersion) { // существующая (старая) версия базы данных
        case 0:
          // версия 0 означает, что на клиенте нет базы данных
          // выполнить инициализацию
          db.createObjectStore("islandNodes", {keyPath: "islandId", autoIncrement: false});
          // fall through
        case 1:
          // на клиенте версия базы данных 1
          // обновить
      }
    };
  });
}
