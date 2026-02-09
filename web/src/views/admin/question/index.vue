<template>
  <div class="page">
    <div class="page-header">
      <a-typography-title :heading="4">题目管理</a-typography-title>
      <a-space>
        <a-button type="primary" :loading="syncing" @click="handleSync">
          <template #icon><IconSync /></template>
          同步数据
        </a-button>
        <a-button type="primary" @click="handleAdd">
          <template #icon><IconPlus /></template>
          新增题目
        </a-button>
      </a-space>
    </div>

    <!-- 题目列表 -->
    <a-card class="list-card">
      <a-space direction="vertical" fill>
        <!-- 搜索栏 -->
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索题目内容"
          search-button
          :loading="searchLoading"
          @search="handleSearch"
          @clear="handleClearSearch"
          allow-clear
        />

        <a-table
          :data="questionList"
          :loading="loading"
          :pagination="pagination"
          @page-change="onPageChange"
          stripe
        >
          <template #columns>
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

            <a-table-column title="操作" width="180" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleEdit(record)">
                    编辑
                  </a-button>
                  <a-button type="text" status="danger" size="small" @click="handleDelete(record)">
                    删除
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-space>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <edit-modal ref="editModalRef" @success="handleSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSync, IconPlus } from '@arco-design/web-vue/es/icon'
import dayjs from 'dayjs'
import {
  getQuestionList,
  deleteQuestion,
  syncQuestions,
  type QuestionItem
} from '@/api/question'
import EditModal from './edit-modal.vue'

const syncing = ref(false)
const searchLoading = ref(false)
const searchKeyword = ref('')
const loading = ref(false)
const questionList = ref<QuestionItem[]>([])

// 分页配置
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50]
})

// 弹窗引用
const editModalRef = ref<InstanceType<typeof EditModal> | null>(null)

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 加载题目列表
const loadQuestionList = async () => {
  loading.value = true
  try {
    const res: any = await getQuestionList({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      keyword: searchKeyword.value || undefined
    })
    questionList.value = res.data.list || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载题目列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadQuestionList()
}

// 清空搜索
const handleClearSearch = () => {
  searchKeyword.value = ''
  pagination.value.current = 1
  loadQuestionList()
}

// 分页切换
const onPageChange = (current: number) => {
  pagination.value.current = current
  loadQuestionList()
}

// 同步数据
const handleSync = async () => {
  syncing.value = true
  try {
    const res: any = await syncQuestions()
    Message.success(`同步完成：共 ${res.data.total} 条，新增 ${res.data.added} 条，跳过 ${res.data.skipped} 条`)
    await loadQuestionList()
  } catch (error) {
    console.error('同步失败:', error)
  } finally {
    syncing.value = false
  }
}

// 新增题目
const handleAdd = () => {
  editModalRef.value?.open()
}

// 编辑题目
const handleEdit = (record: QuestionItem) => {
  editModalRef.value?.openEdit(record)
}

// 删除题目
const handleDelete = (record: QuestionItem) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该题目吗？',
    okText: '删除',
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      try {
        await deleteQuestion(record.id)
        Message.success('删除成功')
        await loadQuestionList()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  })
}

// 操作成功回调
const handleSuccess = () => {
  pagination.value.current = 1
  loadQuestionList()
}

// 初始化加载
onMounted(() => {
  loadQuestionList()
})
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
