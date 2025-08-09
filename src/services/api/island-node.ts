import HeroClient from '@/api/HeroClient'
import type { Island } from '@/api/IslandApi'
import type { IslandNodeList, Node, NodeFilter, NodeMap } from '@/api/NodeApi'
import { INDEXED_DB_NAME } from '@/core/storage'
import { isObject } from '@/helpers/core'

type DateByIslandMap = { [key: number]: string }

const client = new HeroClient()

export async function getNodesMap(
  island: Island,
  isForce = false,
  filter?: NodeFilter
): Promise<IslandNodeList> {
  let nodeList: IslandNodeList | null = null
  const isEmptyFilter = filter === undefined || Object.values(filter).every((a) => a === undefined)
  const previosUpdatedAt = loadPreviousUpdatedAt(island)
  const isLoadFromServer =
    !previosUpdatedAt ||
    !island.nodesLastUpdatedAt ||
    previosUpdatedAt < island.nodesLastUpdatedAt ||
    isForce ||
    !isEmptyFilter

  try {
    if (!isLoadFromServer) {
      nodeList = await readNodesFromCache(island)
    }
    if (!isNodeListVersion2(nodeList)) {
      nodeList = null
    }
  } catch (error) {
    console.error(error) // TODO: log it
    nodeList = null
  }

  if (nodeList === null || nodeList === undefined) {
    nodeList = await client.node.byIslandList(island.id, filter)

    if (isEmptyFilter) {
      writeNodesToCache(island, nodeList)
      savePreviousUpdatedAt(island)
    }

    if (!isNodeListVersion2(nodeList)) {
      nodeList = null
    }
  }
  if (nodeList === null || nodeList === undefined) {
    nodeList = {
      nodes: new Map<number, Node>(),
      nodesTotalCount: 0,
      rewards: {},
    }
  }

  return nodeList
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNodeListVersion2(data: any): boolean {
  return (
    data?.nodes &&
    typeof data.nodes === 'object' &&
    typeof data.nodesTotalCount === 'number' &&
    typeof data.rewards === 'object'
  )
}

const PREVIOUS_DATES_NAME = 'island.previosUpdateDates'

export function resetCache() {
  localStorage.setItem(PREVIOUS_DATES_NAME, JSON.stringify({}))
}

function loadPreviousUpdatedAt(island: Island): Date | null {
  let datesByIsland: DateByIslandMap = {}

  try {
    datesByIsland = JSON.parse(localStorage.getItem(PREVIOUS_DATES_NAME) ?? '')
    if (!isObject(datesByIsland)) {
      datesByIsland = {}
    }
  } catch {
    datesByIsland = {}
  }

  const date = datesByIsland[island.id]
  if (date) {
    return new Date(date)
  }

  return null
}

function savePreviousUpdatedAt(island: Island) {
  let datesByIsland: DateByIslandMap = {}

  try {
    const item = localStorage.getItem(PREVIOUS_DATES_NAME)

    if (item !== null) {
      datesByIsland = JSON.parse(item)

      if (!isObject(datesByIsland)) {
        datesByIsland = {}
      }
    }
  } catch {
    datesByIsland = {}
  }

  datesByIsland[island.id] = new Date().toISOString()

  localStorage.setItem(PREVIOUS_DATES_NAME, JSON.stringify(datesByIsland))
}

async function writeNodesToCache(
  island: Island,
  nodeList: IslandNodeList
): Promise<IDBValidKey | undefined> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('islandNodes', 'readwrite')
    const nodeStore = transaction.objectStore('islandNodes')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newNodes: { [key: string]: any } = {}

    nodeList.nodes.forEach((node, id) => {
      newNodes[id.toString()] = node
    })

    const request = nodeStore.put({
      islandId: island.id,
      nodeList: {
        nodesTotalCount: nodeList.nodesTotalCount,
        rewards: nodeList.rewards,
        nodes: newNodes,
      },
    })

    request.onsuccess = function () {
      resolve(request.result)
    }
    request.onerror = function () {
      reject(request.error)
    }
  })
}

async function readNodesFromCache(island: Island): Promise<IslandNodeList | null> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('islandNodes', 'readonly')
    const nodeStore = transaction.objectStore('islandNodes')
    const request = nodeStore.get(island.id)

    request.onsuccess = () => {
      const nodeList = request.result?.nodeList

      if (!nodeList) {
        return resolve(null)
      }

      try {
        const nodes: NodeMap = new Map<number, Node>()

        for (const id in nodeList.nodes) {
          const node = nodeList.nodes[id]
          nodes.set(node.id, node)
        }
        nodeList.nodes = nodes

        resolve(nodeList)
      } catch {
        resolve(null)
      }
    }
    request.onerror = () => {
      reject(request.error)
    }
  })
}

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const openRequest = window.indexedDB.open(INDEXED_DB_NAME)

    openRequest.onerror = () => {
      reject(openRequest.error)
    }
    openRequest.onsuccess = () => {
      const db = openRequest.result

      db.onversionchange = () => {
        db.close()
      }

      resolve(db)
    }
    openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBRequest).result as IDBDatabase

      if (!db.objectStoreNames.contains('islandNodes')) {
        db.createObjectStore('islandNodes', { keyPath: 'islandId', autoIncrement: false })
      }
    }
  })
}
