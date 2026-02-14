<template>
  <div class="qa">
    <a-space direction="vertical" fill size="medium">
      <a-input-group class="qa-head">
        <a-input-search
          ref="inputEl"
          v-model="searchQuery"
          class="qa-input"
          placeholder="搜索题库：支持 question / indexes"
          allow-clear
          search-button
          @search="handleSearch"
          @clear="clearSearch"
        />
      </a-input-group>

      <a-typography-text type="secondary" class="qa-meta">
        <span v-if="tkLoading">题库加载中…</span>
        <span v-else-if="tkError">题库加载失败：{{ tkError }}</span>
        <span v-else>题库：{{ tkList.length }} 条（来源：{{ tkSourceText }}）</span>
        <template v-if="normalizedQuery">
          · 命中 {{ matchedTotal }} 条
          <span v-if="matchedTotal > resultLimit">（仅展示前 {{ resultLimit }} 条）</span>
        </template>
      </a-typography-text>

      <div v-if="normalizedQuery" class="qa-results">
        <a-empty v-if="matchedList.length === 0" description="无匹配结果" />
        <div v-else class="qa-list">
          <a-card
            v-for="item in matchedList"
            :key="itemKey(item)"
            class="qa-item"
            :bordered="true"
            size="small"
          >
            <template #title>
              <div class="qa-q">
                <template v-for="(p, i) in highlightParts(item.question, normalizedQuery)" :key="i">
                  <a-tag v-if="p.hit" color="arcoblue" class="hit-tag">{{ p.text }}</a-tag>
                  <span v-else>{{ p.text }}</span>
                </template>
              </div>
            </template>
            <a-typography-text type="secondary" class="qa-i">
              <span class="qa-i-label">indexes：</span>
              <template v-for="(p, i) in highlightParts(item.indexes ?? '-', normalizedQuery)" :key="i">
                <a-tag v-if="p.hit" color="arcoblue" class="hit-tag">{{ p.text }}</a-tag>
                <span v-else>{{ p.text }}</span>
              </template>
            </a-typography-text>
            <a-typography-text type="danger" class="qa-a">
              {{ item.answer }}
            </a-typography-text>
          </a-card>
        </div>
      </div>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { getAllQuestions, getLatestUpdateTime } from '@/api/question'
import { getCachedTkList, setCachedTkList, getCachedUpdateTime, setCachedUpdateTime, type TkItem } from '@/db'

type TkSource = 'idb' | 'api' | 'none'

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
  if (tkSource.value === 'api') return '服务器'
  return '-'
})

function itemKey(item: TkItem) {
  return item.id ?? `${item.question}-${item.indexes ?? ''}`
}

function clearSearch() {
  searchQuery.value = ''
  debouncedQuery.value = ''
}

function handleSearch() {
  // 搜索逻辑由 watch 处理
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

async function loadFromApiAndCache() {
  tkLoading.value = true
  tkError.value = null
  try {
    const res = await getAllQuestions()
    const data = res.data
    if (!Array.isArray(data)) throw new Error('返回数据不是数组')

    const list = data.map(normalizeItem).filter(Boolean) as TkItem[]
    tkList.value = list
    tkSource.value = 'api'

    // 保存数据到本地缓存
    void setCachedTkList(list)

    // 获取并保存服务器更新时间
    const timeRes = await getLatestUpdateTime()
    if (timeRes.data.latestUpdateTime) {
      void setCachedUpdateTime(timeRes.data.latestUpdateTime)
    }
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
    // 并行获取服务器更新时间和本地缓存
    const [serverTimeRes, cached, cachedUpdateTime] = await Promise.all([
      getLatestUpdateTime(),
      getCachedTkList(),
      getCachedUpdateTime(),
    ])

    const serverUpdateTime = serverTimeRes.data.latestUpdateTime

    // 如果服务器时间和本地时间一致，且有本地缓存，则使用本地缓存
    if (
      serverUpdateTime &&
      cachedUpdateTime === serverUpdateTime &&
      cached &&
      cached.length > 0
    ) {
      tkList.value = cached
      tkSource.value = 'idb'
      tkLoading.value = false
      return
    }

    // 否则从服务器获取数据
    await loadFromApiAndCache()
  } catch {
    // 出错时尝试使用本地缓存
    try {
      const cached = await getCachedTkList()
      if (cached && cached.length > 0) {
        tkList.value = cached
        tkSource.value = 'idb'
        tkLoading.value = false
        return
      }
    } catch {
      // 本地缓存也不可用
    }

    // 最后尝试从服务器加载
    await loadFromApiAndCache()
  } finally {
    tkLoading.value = false
  }
}

onMounted(() => {
  void initTk()
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
}

.qa-meta {
  font-size: 12px;
}

.qa-results {
  max-height: 500px;
  overflow: auto;
}

.qa-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qa-item :deep(.arco-card-header) {
  padding-bottom: 8px;
}

.qa-item :deep(.arco-card-body) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qa-q {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.qa-i {
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.qa-i-label {
  opacity: 0.75;
}

.qa-a {
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
}

.hit-tag {
  margin: 0 2px;
}
</style>
