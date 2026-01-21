<template>
  <div class="tabs" role="tablist" aria-label="Tabs">
    <button
      v-for="t in tabs"
      :key="t.key"
      class="tab"
      type="button"
      role="tab"
      :disabled="t.disabled"
      :aria-selected="activeKey === t.key"
      :data-active="activeKey === t.key ? 'true' : 'false'"
      @click="onClick(t)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TabItem, TabKey } from './types'

const props = withDefaults(defineProps<{
  modelValue?: TabKey
  tabs: TabItem[]
}>(), {
  modelValue: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: TabKey): void
  (e: 'change', v: TabKey): void
}>()

const firstKey = computed<TabKey>(() => props.tabs[0]?.key ?? '')
const inner = ref<TabKey>(props.modelValue ?? firstKey.value)

const activeKey = computed<TabKey>(() => {
  return props.modelValue ?? inner.value
})

watch(() => props.tabs, () => {
  if (!activeKey.value) {
    if (props.modelValue === undefined) inner.value = firstKey.value
    else emit('update:modelValue', firstKey.value)
    return
  }
  const exists = props.tabs.some((t) => t.key === activeKey.value)
  if (!exists) {
    if (props.modelValue === undefined) inner.value = firstKey.value
    else emit('update:modelValue', firstKey.value)
  }
}, { deep: true })

function setActive(next: TabKey) {
  if (!next) return
  if (props.modelValue === undefined) inner.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

function onClick(t: TabItem) {
  if (t.disabled) return
  if (t.key === activeKey.value) return
  setActive(t.key)
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 8px;
}

.tab {
  border: 1px solid var(--line);
  background: transparent;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
}

.tab:hover {
  background: rgba(30, 30, 30, 0.06);
}

.tab[data-active='true'] {
  border-color: rgba(30, 30, 30, 0.28);
  background: rgba(30, 30, 30, 0.10);
}

.tab:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>

