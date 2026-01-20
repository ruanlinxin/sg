<template>
  <div class="qa">
    <div class="qa-head">
      <input
        ref="inputEl"
        v-model="searchQuery"
        class="qa-input"
        type="search"
        autocomplete="off"
        placeholder="搜索题库：支持 question / indexes"
      />
      <button class="qa-btn" type="button" :disabled="!searchQuery.trim()" @click="clearSearch">
        清空
      </button>
    </div>

    <div class="muted qa-meta">
      <span v-if="tkLoading">题库加载中…</span>
      <span v-else-if="tkError">题库加载失败：{{ tkError }}</span>
      <span v-else>题库：{{ tkList.length }} 条（来源：{{ tkSourceText }}）</span>
      <template v-if="normalizedQuery">
        · 命中 {{ matchedTotal }} 条
        <span v-if="matchedTotal > resultLimit">（仅展示前 {{ resultLimit }} 条）</span>
      </template>
    </div>

    <div v-if="normalizedQuery" class="qa-results">
      <div v-if="matchedList.length === 0" class="muted">无匹配结果</div>
      <div v-else class="qa-list">
        <div v-for="item in matchedList" :key="itemKey(item)" class="qa-item">
          <div class="qa-q">
            <template v-for="(p, i) in highlightParts(item.question, normalizedQuery)" :key="i">
              <span :class="p.hit ? 'hit' : ''">{{ p.text }}</span>
            </template>
          </div>
          <div class="qa-i muted">
            <span class="qa-i-label">indexes：</span>
            <template v-for="(p, i) in highlightParts(item.indexes ?? '-', normalizedQuery)" :key="i">
              <span :class="p.hit ? 'hit' : ''">{{ p.text }}</span>
            </template>
          </div>
          <div class="qa-a">{{ item.answer }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import tkJsonUrl from './gettkjson.json?url'
import { getCachedTkList, setCachedTkList, type TkItem } from './tkIdb'

type TkSource = 'idb' | 'json' | 'none'

const tkList = ref<TkItem[]>([])
const tkLoading = ref(false)
const tkError = ref<string | null>(null)
const tkSource = ref<TkSource>('none')

const inputEl = ref<HTMLInputElement | null>(null)

const searchQuery = ref('')
const debouncedQuery = ref('')
const resultLimit = 50

let debounceTimer: number | undefined
watch(searchQuery, (v) => {
  window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    debouncedQuery.value = v
  }, 120)
})

const normalizedQuery = computed(() => debouncedQuery.value.trim().toLowerCase())

const tkSourceText = computed(() => {
  if (tkSource.value === 'idb') return '缓存'
  if (tkSource.value === 'json') return '本地文件'
  return '-'
})

function itemKey(item: TkItem) {
  return item.id ?? `${item.question}-${item.indexes ?? ''}`
}

function clearSearch() {
  searchQuery.value = ''
  debouncedQuery.value = ''
}

function normalizeItem(raw: unknown): TkItem | null {
  if (!raw || typeof raw !== 'object') return null
  const x = raw as Record<string, unknown>
  const question = typeof x.question === 'string' ? x.question : ''
  const answer = typeof x.answer === 'string' ? x.answer : ''
  if (!question || !answer) return null
  const id = typeof x.id === 'number' || typeof x.id === 'string' ? x.id : undefined
  const indexes = typeof x.indexes === 'string' ? x.indexes : undefined
  return { id, question, answer, indexes }
}

async function loadFromJsonAndCache() {
  tkLoading.value = true
  tkError.value = null
  try {
    const res = await fetch(tkJsonUrl, { cache: 'force-cache' })
    console.log(res,'res')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as unknown
    if (!Array.isArray(data)) throw new Error('JSON 数据不是数组')

    const list = data.map(normalizeItem).filter(Boolean) as TkItem[]
    tkList.value = list
    tkSource.value = 'json'

    void setCachedTkList(list)
  } catch (e) {
    tkError.value = e instanceof Error ? e.message : String(e)
    tkList.value = []
    tkSource.value = 'none'
  } finally {
    tkLoading.value = false
  }
}

async function initTk() {
  tkLoading.value = true
  tkError.value = null
  try {
    const cached = await getCachedTkList()
    if (cached && cached.length > 0) {
      tkList.value = cached
      tkSource.value = 'idb'
      return
    }
  } catch {
    // 缓存不可用时直接回退到本地文件
  } finally {
    tkLoading.value = false
  }

  void loadFromJsonAndCache()
}

onMounted(() => {
  void initTk()
  inputEl.value?.focus()
})

const matchedAll = computed(() => {
  const q = normalizedQuery.value
  if (!q) return []

  return tkList.value.filter((x) => {
    const question = String(x.question ?? '').toLowerCase()
    const indexes = String(x.indexes ?? '').toLowerCase()
    return question.includes(q) || indexes.includes(q)
  })
})

const matchedTotal = computed(() => matchedAll.value.length)
const matchedList = computed(() => matchedAll.value.slice(0, resultLimit))

type HighlightPart = {
  text: string
  hit: boolean
}

function highlightParts(text: string, query: string): HighlightPart[] {
  if (!query) return [{ text, hit: false }]
  if (!text) return [{ text: '', hit: false }]

  const parts: HighlightPart[] = []
  const hay = text
  const hayLower = hay.toLowerCase()
  const needle = query

  let from = 0
  while (from < hay.length) {
    const at = hayLower.indexOf(needle, from)
    if (at === -1) {
      parts.push({ text: hay.slice(from), hit: false })
      break
    }

    if (at > from) {
      parts.push({ text: hay.slice(from, at), hit: false })
    }
    parts.push({ text: hay.slice(at, at + needle.length), hit: true })
    from = at + needle.length
  }

  return parts
}
</script>

<style scoped>
.qa {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qa-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qa-input {
  flex: 1;
  width: 100%;
  border: 1px solid var(--line);
  background: transparent;
  padding: 8px 10px;
  font-size: 13px;
  outline: none;
}

.qa-input:focus {
  box-shadow: 0 0 0 2px rgba(15, 125, 167, 0.15);
}

.qa-btn {
  border: 1px solid var(--line);
  background: transparent;
  padding: 6px 10px;
  cursor: pointer;
}

.qa-btn:hover {
  background: rgba(30, 30, 30, 0.06);
}

.qa-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.qa-meta {
  font-size: 12px;
}

.qa-results {
  max-height: 400px;
  overflow: auto;
}

.qa-item {
  padding: 10px 0;
}

.qa-item + .qa-item {
  border-top: 1px solid var(--line);
}

.qa-q {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.qa-i {
  font-size: 12px;
  margin-bottom: 6px;
  white-space: pre-wrap;
  word-break: break-word;
}

.qa-i-label {
  opacity: 0.75;
}

.qa-a {
  font-size: 12px;
  color: #d12b2b;
  white-space: pre-wrap;
  word-break: break-word;
}

.hit {
  background: rgba(255, 210, 84, 0.6);
  box-shadow: inset 0 0 0 1px rgba(30, 30, 30, 0.18);
  padding: 0 1px;
}
</style>
