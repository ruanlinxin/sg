<template>
  <div class="page">
    <div class="page-header">
      <a-typography-title :heading="4">{{ title }}</a-typography-title>
      <a-button type="primary" @click="$emit('add')">
        <template #icon><icon-plus /></template>
        {{ addText }}
      </a-button>
    </div>

    <!-- 列表卡片 -->
    <a-card class="list-card">
      <a-space direction="vertical" fill>
        <!-- 搜索栏 -->
        <slot name="search">
          <a-input-search
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            search-button
            :loading="searchLoading"
            @search="$emit('search')"
            @clear="$emit('clear-search')"
            allow-clear
          />
        </slot>

        <!-- 表格 -->
        <a-table
          :data="list"
          :loading="loading"
          :pagination="pagination"
          @page-change="$emit('page-change', $event)"
          stripe
        >
          <template #columns>
            <slot name="columns" :format-date="formatDate" />

            <!-- 操作列 -->
            <a-table-column
              v-if="showActions"
              title="操作"
              :width="actionWidth"
              fixed="right"
            >
              <template #cell="{ record }">
                <a-space>
                  <a-button
                    type="text"
                    size="small"
                    @click="$emit('edit', record)"
                  >
                    编辑
                  </a-button>
                  <a-button
                    type="text"
                    status="danger"
                    size="small"
                    @click="$emit('delete', record)"
                  >
                    删除
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-space>
    </a-card>

    <!-- 新增弹窗 -->
    <a-modal
      v-model:visible="addModalVisible"
      :title="addTitle"
      @ok="$emit('add-submit')"
      @cancel="$emit('add-cancel')"
      :ok-loading="submitting"
      unmount-on-close
    >
      <a-form :model="form" auto-label-width>
        <slot name="add-form-items" :form="form" />
      </a-form>
    </a-modal>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:visible="editModalVisible"
      :title="editTitle"
      @ok="$emit('edit-submit')"
      @cancel="$emit('edit-cancel')"
      :ok-loading="editSubmitting"
      unmount-on-close
    >
      <a-form :model="editForm" auto-label-width>
        <slot name="edit-form-items" :form="editForm" />
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { IconPlus } from '@arco-design/web-vue/es/icon'
import dayjs from 'dayjs'

interface Props {
  title: string
  addText?: string
  addTitle?: string
  searchPlaceholder?: string
  editTitle?: string
  showActions?: boolean
  actionWidth?: number

  // 状态
  loading: boolean
  submitting: boolean
  editSubmitting: boolean
  searchLoading: boolean
  list: any[]
  pagination: {
    total: number
    current: number
    pageSize: number
    showTotal: boolean
    showJumper: boolean
    showPageSize: boolean
    pageSizeOptions: number[]
  }
  searchKeyword: string
  addModalVisible: boolean
  editModalVisible: boolean
  form: any
  editForm: any
}

withDefaults(defineProps<Props>(), {
  addText: '新增',
  addTitle: '新增',
  searchPlaceholder: '搜索',
  editTitle: '编辑',
  showActions: true,
  actionWidth: 180
})

defineEmits<{
  add: []
  'add-submit': []
  'add-cancel': []
  search: []
  'clear-search': []
  'page-change': [current: number]
  edit: [record: any]
  delete: [record: any]
  'edit-submit': []
  'edit-cancel': []
}>()

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 暴露formatDate给slot使用
defineExpose({ formatDate })
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-card {
  background: #fff;
}

.text-gray {
  color: var(--color-text-3);
}
</style>
