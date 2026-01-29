export type TkItem = {
  id?: number | string
  question: string
  answer: string
  indexes?: string
}

import { getKv, setKv } from './sgDb'

const TK_KEY = 'tkList:v1'

export async function getCachedTkList(): Promise<TkItem[] | null> {
  const value = await getKv<unknown>(TK_KEY)
  if (!Array.isArray(value)) return null
  return value as TkItem[]
}

export async function setCachedTkList(list: TkItem[]) {
  await setKv(TK_KEY, list)
}

