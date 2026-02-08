<template>
  <ListPage
    v-bind="listPage"
    title="题目管理"
    add-text="新增题目"
    add-title="新增题目"
    search-placeholder="搜索题目内容"
    edit-title="编辑题目"
    @add="listPage.handleAdd"
    @add-submit="handleSubmit"
    @add-cancel="listPage.handleAddCancel"
    @search="listPage.handleSearch"
    @clear-search="listPage.handleClearSearch"
    @page-change="listPage.onPageChange"
    @edit="listPage.handleEdit"
    @delete="listPage.handleDelete"
    @edit-submit="handleEditSubmit"
    @edit-cancel="listPage.handleEditCancel"
  >
    <!-- 新增弹窗内容 -->
    <template #add-form-items="{ form }">
      <a-form-item field="question" label="题目" required>
        <a-textarea
          v-model="form.question"
          placeholder="请输入题目内容"
          :auto-size="{ minRows: 2, maxRows: 4 }"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="answer" label="答案" required>
        <a-textarea
          v-model="form.answer"
          placeholder="请输入答案内容"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="indexes" label="索引">
        <a-input
          v-model="form.indexes"
          placeholder="可选：输入索引关键词"
          allow-clear
        />
      </a-form-item>
    </template>

    <!-- 搜索栏扩展 -->
    <template #search>
      <a-space>
        <a-input-search
          v-model="listPage.searchKeyword.value"
          placeholder="搜索题目内容"
          search-button
          :loading="listPage.searchLoading.value"
          @search="listPage.handleSearch"
          @clear="listPage.handleClearSearch"
          allow-clear
          style="width: 300px"
        />
        <a-button type="primary" :loading="syncing" @click="handleSync">
          <template #icon><IconSync /></template>
          同步数据
        </a-button>
      </a-space>
    </template>

    <!-- 表格列 -->
    <template #columns="{ formatDate }">
      <a-table-column title="题目" data-index="question" ellipsis tooltip>
        <template #cell="{ record }">
          <a-typography-text>{{ record.question }}</a-typography-text>
        </template>
      </a-table-column>

      <a-table-column title="答案" data-index="answer" ellipsis tooltip>
        <template #cell="{ record }">
          <a-typography-text type="danger">{{ record.answer }}</a-typography-text>
        </template>
      </a-table-column>

      <a-table-column title="索引" data-index="indexes" width="150">
        <template #cell="{ record }">
          <a-tag v-if="record.indexes" color="arcoblue" size="small">
            {{ record.indexes }}
          </a-tag>
          <span v-else class="text-gray">-</span>
        </template>
      </a-table-column>

      <a-table-column title="创建时间" data-index="createdAt" width="180">
        <template #cell="{ record }">
          {{ formatDate(record.createdAt) }}
        </template>
      </a-table-column>
    </template>

    <!-- 编辑弹窗内容 -->
    <template #edit-form-items="{ form }">
      <a-form-item field="question" label="题目" required>
        <a-textarea
          v-model="form.question"
          placeholder="请输入题目内容"
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>

      <a-form-item field="answer" label="答案" required>
        <a-textarea
          v-model="form.answer"
          placeholder="请输入答案内容"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </a-form-item>

      <a-form-item field="indexes" label="索引">
        <a-input v-model="form.indexes" placeholder="可选：输入索引关键词" />
      </a-form-item>
    </template>
  </ListPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSync } from '@arco-design/web-vue/es/icon'
import ListPage from '@/components/list-page/index.vue'
import { useListPage } from '@/composables/useListPage'
import {
  createQuestion,
  getQuestionList,
  updateQuestion,
  deleteQuestion,
  syncQuestions,
  type QuestionItem
} from '@/api/question'

const syncing = ref(false)

const defaultFormData = () => ({
  question: '',
  answer: '',
  indexes: ''
})

const listPage = useListPage<QuestionItem>({
  title: '题目管理',
  listApi: getQuestionList,
  createApi: createQuestion,
  updateApi: updateQuestion,
  deleteApi: deleteQuestion,
  defaultFormData,
  transformSubmitData: (formData) => ({
    question: formData.question.trim(),
    answer: formData.answer.trim(),
    indexes: formData.indexes.trim() || undefined
  }),
  transformEditData: (record) => ({
    question: record.question,
    answer: record.answer,
    indexes: record.indexes || ''
  }),
  deleteConfirmText: () => '确定要删除该题目吗？'
})

// 同步数据
const handleSync = async () => {
  syncing.value = true
  try {
    const res: any = await syncQuestions()
    Message.success(`同步完成：共 ${res.data.total} 条，新增 ${res.data.added} 条，跳过 ${res.data.skipped} 条`)
    await listPage.loadList()
  } catch (error) {
    console.error('同步失败:', error)
  } finally {
    syncing.value = false
  }
}

// 验证并提交
const handleSubmit = async () => {
  if (!listPage.form.value.question.trim() || !listPage.form.value.answer.trim()) {
    Message.warning('请填写完整的题目和答案')
    return
  }
  await listPage.handleSubmit()
}

const handleEditSubmit = async () => {
  if (!listPage.editForm.value.question.trim() || !listPage.editForm.value.answer.trim()) {
    Message.warning('请填写完整的题目和答案')
    return
  }
  await listPage.handleEditSubmit()
}
</script>

<style scoped>
.text-gray {
  color: var(--color-text-3);
}
</style>
