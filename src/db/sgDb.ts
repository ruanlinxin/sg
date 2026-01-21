import Dexie, { type Table } from 'dexie'

export type KvRecord = {
  key: string
  value: unknown
  updatedAt: number
}

class SgDb extends Dexie {
  kv!: Table<KvRecord, string>

  constructor() {
    super('sg')
    this.version(1).stores({
      kv: '&key, updatedAt'
    })
  }
}

export const db = new SgDb()

export async function getKv<T>(key: string): Promise<T | null> {
  const rec = await db.kv.get(key)
  return (rec?.value as T) ?? null
}

export async function setKv(key: string, value: unknown) {
  await db.kv.put({ key, value, updatedAt: Date.now() })
}

