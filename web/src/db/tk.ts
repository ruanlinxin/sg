export type TkItem = {
  id?: number | string
  question: string
  answer: string
  indexes?: string
}

import { getKv, setKv } from './sgDb'

const TK_KEY = 'tkList:v1'
const TK_UPDATE_TIME_KEY = 'tkList:updateTime'

export async function getCachedTkList(): Promise<TkItem[] | null> {
  const value = await getKv<unknown>(TK_KEY)
  if (!Array.isArray(value)) return null
  return value as TkItem[]
}

export async function setCachedTkList(list: TkItem[]) {
  await setKv(TK_KEY, list)
}

export async function getCachedUpdateTime(): Promise<string | null> {
  const value = await getKv<unknown>(TK_UPDATE_TIME_KEY)
  if (typeof value !== 'string') return null
  return value
}

export async function setCachedUpdateTime(updateTime: string) {
  await setKv(TK_UPDATE_TIME_KEY, updateTime)
}

