<template>
  <li class="node">
    <button
      class="row"
      type="button"
      :disabled="item.disabled"
      :data-active="isActive ? 'true' : 'false'"
      :aria-expanded="hasChildren ? open : undefined"
      :style="rowStyle"
      @click="onRowClick"
    >
      <span class="label">
        {{ item.label }}
      </span>

      <span v-if="hasChildren" class="caret" :data-open="open ? 'true' : 'false'">
        >
      </span>
    </button>

    <ul v-if="hasChildren" v-show="open" class="children" role="group">
      <MenuNode
        v-for="(child, idx) in item.children"
        :key="child.id ?? `${id}/${idx}`"
        :item="child"
        :id="child.id ?? `${id}/${idx}`"
        :level="level + 1"
        :open="isOpen(child.id ?? `${id}/${idx}`)"
        :indent="indent"
        :base-pad="basePad"
        :is-open="isOpen"
        :toggle="toggle"
        :navigate="navigate"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { MenuItem, MenuKey } from './types'
import type { RouteLocationRaw } from 'vue-router'
import { colors } from '../../enums/color'

defineOptions({ name: 'MenuNode' })

const props = defineProps<{
  item: MenuItem
  id: MenuKey
  level: number
  open: boolean
  indent: number
  basePad: number
  isOpen: (id: MenuKey) => boolean
  toggle: (id: MenuKey) => void
  navigate: (to: RouteLocationRaw) => void
}>()

const router = useRouter()
const route = useRoute()

const hasChildren = computed(() => (props.item.children?.length ?? 0) > 0)

const levelColor = computed(() => colors[props.level % colors.length])

const rowStyle = computed<Record<string, string>>(() => {
  return {
    paddingLeft: `${props.basePad + props.level * props.indent}px`,
    '--level-color': levelColor.value
  }
})

const isActive = computed(() => {
  if (!props.item.to) return false
  return router.resolve(props.item.to).path === route.path
})

function onRowClick() {
  if (props.item.disabled) return
  if (hasChildren.value) {
    props.toggle(props.id)
    return
  }
  if (props.item.to) props.navigate(props.item.to)
}
</script>

<style scoped>
.node {
  list-style: none;
  margin: 0;
  padding: 0;
}

.row {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border:0 solid var(--line);
  background: transparent;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-right: 10px;
  cursor: pointer;
  text-align: left;
}

.row::before {
  content: '';
  position: absolute;
  left: 1px;
  top: 1px;
  bottom: 1px;
  width: 2px;
  background: var(--level-color);
}

.row:hover {
  background: rgba(30, 30, 30, 0.06);
}

.row[data-active='true'] {
  background: rgba(30, 30, 30, 0.12);
}

.row:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.label {
  font-size: 13px;
  line-height: 1.2;
}

.caret {
  font-size: 12px;
  opacity: 0.75;
  transform: rotate(0deg);
  transition: transform 120ms ease;
}

.caret[data-open='true'] {
  transform: rotate(90deg);
}

.children {
  margin: 6px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
