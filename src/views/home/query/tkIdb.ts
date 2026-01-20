export type TkItem = {
  id?: number | string
  question: string
  answer: string
  indexes?: string
}

type KvRecord = {
  key: string
  value: unknown
  updatedAt: number
}

const DB_NAME = 'sg'
const DB_VERSION = 1
const STORE_NAME = 'kv'
const TK_KEY = 'tkList:v1'

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB 打开失败'))
  })
}

function reqToPromise<T>(req: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB 请求失败'))
  })
}

async function getKv<T>(key: string): Promise<T | null> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const rec = (await reqToPromise(store.get(key))) as KvRecord | undefined
    return (rec?.value as T) ?? null
  } finally {
    db.close()
  }
}

async function setKv(key: string, value: unknown) {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const rec: KvRecord = { key, value, updatedAt: Date.now() }
    await reqToPromise(store.put(rec))
  } finally {
    db.close()
  }
}

export async function getCachedTkList(): Promise<TkItem[] | null> {
  const value = await getKv<unknown>(TK_KEY)
  if (!Array.isArray(value)) return null
  return value as TkItem[]
}

export async function setCachedTkList(list: TkItem[]) {
  await setKv(TK_KEY, list)
}
