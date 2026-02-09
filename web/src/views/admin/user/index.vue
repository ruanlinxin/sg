<template>
  <div class="page">
    <div class="page-header">
      <a-typography-title :heading="4">用户管理</a-typography-title>
      <a-button type="primary" @click="handleAdd">
        <template #icon><icon-plus /></template>
        新增用户
      </a-button>
    </div>

    <!-- 用户列表 -->
    <a-card class="list-card">
      <a-space direction="vertical" fill>
        <!-- 搜索栏 -->
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索用户名"
          search-button
          :loading="searchLoading"
          @search="handleSearch"
          @clear="handleClearSearch"
          allow-clear
        />

        <a-table
          :data="userList"
          :loading="loading"
          :pagination="pagination"
          @page-change="onPageChange"
          stripe
        >
          <template #columns>
            <a-table-column title="ID" data-index="id" width="220" ellipsis tooltip />
            <a-table-column title="用户名" data-index="username" />
            <a-table-column title="邮箱" data-index="email" />
            <a-table-column title="昵称" data-index="nickname">
              <template #cell="{ record }">
                {{ record.nickname || '-' }}
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
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import {
  getUserList,
  deleteUser,
  type UserItem
} from '@/api/user'
import EditModal from './edit-modal.vue'

const searchLoading = ref(false)
const searchKeyword = ref('')

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

// 用户列表
const loading = ref(false)
const userList = ref<UserItem[]>([])

// 弹窗引用
const editModalRef = ref<InstanceType<typeof EditModal> | null>(null)

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const res: any = await getUserList({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      keyword: searchKeyword.value || undefined
    })
    userList.value = res.data.list || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadUserList()
}

// 清空搜索
const handleClearSearch = () => {
  searchKeyword.value = ''
  pagination.value.current = 1
  loadUserList()
}

// 分页切换
const onPageChange = (current: number) => {
  pagination.value.current = current
  loadUserList()
}

// 新增用户
const handleAdd = () => {
  editModalRef.value?.open()
}

// 编辑用户
const handleEdit = (record: UserItem) => {
  editModalRef.value?.openEdit(record)
}

// 删除用户
const handleDelete = (record: UserItem) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 "${record.username}" 吗？`,
    okText: '删除',
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      try {
        await deleteUser(record.id)
        Message.success('删除成功')
        await loadUserList()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  })
}

// 操作成功回调
const handleSuccess = () => {
  pagination.value.current = 1
  loadUserList()
}

// 初始化加载
onMounted(() => {
  loadUserList()
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
