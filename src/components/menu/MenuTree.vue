<template>
  <nav class="menu" aria-label="菜单">
    <ul class="list">
      <MenuNode
        v-for="(item, idx) in items"
        :key="item.id ?? `root/${idx}`"
        :item="item"
        :id="item.id ?? `root/${idx}`"
        :level="0"
        :open="isOpen(item.id ?? `root/${idx}`)"
        :indent="indent"
        :base-pad="basePad"
        :is-open="isOpen"
        :toggle="toggle"
        :navigate="navigate"
      />
    </ul>
  </nav>
</template>

<script setup lang="ts">
import MenuNode from './MenuNode.vue'
import type { MenuItem, MenuKey } from './types'
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(defineProps<{
  items: MenuItem[]
  modelValue?: MenuKey[]
  defaultOpenIds?: MenuKey[]
  indent?: number
  basePad?: number
}>(), {
  modelValue: undefined,
  defaultOpenIds: () => [],
  indent: 12,
  basePad: 10
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: MenuKey[]): void
  (e: 'toggle', payload: { id: MenuKey, open: boolean }): void
  (e: 'navigate', payload: { to: RouteLocationRaw }): void
}>()

const router = useRouter()

const inner = ref<Set<MenuKey>>(new Set(props.defaultOpenIds))

const openSet = computed(() => {
  if (props.modelValue) return new Set(props.modelValue)
  return inner.value
})

function isOpen(id: MenuKey) {
  return openSet.value.has(id)
}

function setOpen(next: Set<MenuKey>) {
  if (props.modelValue) {
    emit('update:modelValue', Array.from(next))
    return
  }
  inner.value = next
}

function toggle(id: MenuKey) {
  const next = new Set(openSet.value)
  const willOpen = !next.has(id)
  if (willOpen) next.add(id)
  else next.delete(id)
  setOpen(next)
  emit('toggle', { id, open: willOpen })
}

function navigate(to: RouteLocationRaw) {
  emit('navigate', { to })
  router.push(to)
}
</script>

<style scoped>
.menu {
  width: 100%;
}

.list {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
