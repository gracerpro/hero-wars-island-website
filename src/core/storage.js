export const INDEXED_DB_NAME = "app";

export function getLocalStorageSize() {
  return localStorage ? JSON.stringify(localStorage).length : 0;
}

export async function getIndexedDbSize() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      return resolve(0);
    }

    const openRequest = window.indexedDB.open(INDEXED_DB_NAME);
    openRequest.onsuccess = async () => {
      const db = openRequest.result;
      let size = 0;

      for (let i = 0; i < db.objectStoreNames.length; ++i) {
        const tablename = db.objectStoreNames[i];

        size += await getTableSize(db, tablename);
      }

      resolve(size);
    };
    openRequest.onerror = function (error) {
      reject(error);
    };
  });
}

async function getTableSize(db, tableName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([tableName]).objectStore(tableName).openCursor();

    let size = 0;
    transaction.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const storedObject = cursor.value;
        const json = JSON.stringify(storedObject);
        size += json.length;
        cursor.continue();
      } else {
        resolve(size);
      }
    };
    transaction.onerror = function (error) {
      reject("error in " + tableName + ": " + error);
    };
  });
}
