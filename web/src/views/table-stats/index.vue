<template>
  <div class="page">
    <a-card :bordered="false" class="sheet-card">
      <Loading v-if="loading" overlay text="表格加载中…" />
      <div ref="containerEl" class="sheet-inner" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useUniver } from '@/hooks'
import { Loading } from '@/components'

const containerEl = ref<HTMLDivElement | null>(null)
const loading = ref(true)

let univerClient: ReturnType<typeof useUniver> | null = null

onMounted(async () => {
  if (!containerEl.value) return
  univerClient = useUniver()
  try {
    await univerClient.mount(containerEl.value)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  univerClient?.dispose?.()
  univerClient = null
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sheet-card {
  position: relative;
  min-height: 520px;
  height: calc(100vh - 200px);
  overflow: hidden;
}

.sheet-inner {
  width: 100%;
  height: 100%;
}
</style>
