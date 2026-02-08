<template>
  <div class="page">
    <a-typography-title :heading="4">用户管理</a-typography-title>

    <!-- 录入表单 -->
    <a-card title="录入新用户" class="form-card">
      <a-form :model="form" @submit="handleSubmit" auto-label-width>
        <a-form-item field="username" label="用户名" required>
          <a-input
            v-model="form.username"
            placeholder="请输入用户名"
            allow-clear
          />
        </a-form-item>

        <a-form-item field="email" label="邮箱" required>
          <a-input
            v-model="form.email"
            placeholder="请输入邮箱"
            allow-clear
          />
        </a-form-item>

        <a-form-item field="password" label="密码" required>
          <a-input-password
            v-model="form.password"
            placeholder="请输入密码（至少6位）"
            allow-clear
          />
        </a-form-item>

        <a-form-item field="nickname" label="昵称">
          <a-input
            v-model="form.nickname"
            placeholder="可选：输入昵称"
            allow-clear
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="submitting">
              保存用户
            </a-button>
            <a-button @click="resetForm">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 用户列表 -->
    <a-card title="用户列表" class="list-card">
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

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑用户"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
      :ok-loading="editSubmitting"
      unmount-on-close
    >
      <a-form :model="editForm" auto-label-width>
        <a-form-item field="username" label="用户名" required>
          <a-input
            v-model="editForm.username"
            placeholder="请输入用户名"
          />
        </a-form-item>

        <a-form-item field="email" label="邮箱" required>
          <a-input
            v-model="editForm.email"
            placeholder="请输入邮箱"
          />
        </a-form-item>

        <a-form-item field="password" label="密码">
          <a-input-password
            v-model="editForm.password"
            placeholder="不修改请留空"
          />
        </a-form-item>

        <a-form-item field="nickname" label="昵称">
          <a-input
            v-model="editForm.nickname"
            placeholder="可选：输入昵称"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import {
  createUser,
  getUserList,
  updateUser,
  deleteUser,
  type UserItem,
  type CreateUserData
} from '@/api/user'

// 表单数据
interface UserForm {
  username: string
  email: string
  password: string
  nickname: string
}

const form = ref<UserForm>({
  username: '',
  email: '',
  password: '',
  nickname: ''
})

const submitting = ref(false)
const loading = ref(false)
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
const userList = ref<UserItem[]>([])

// 编辑相关
const editModalVisible = ref(false)
const editSubmitting = ref(false)
const editingId = ref('')
const editForm = ref<UserForm>({
  username: '',
  email: '',
  password: '',
  nickname: ''
})

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

// 提交表单
const handleSubmit = async () => {
  if (!form.value.username.trim() || !form.value.email.trim() || !form.value.password.trim()) {
    Message.warning('请填写完整的用户信息')
    return
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    Message.warning('邮箱格式不正确')
    return
  }

  if (form.value.password.length < 6) {
    Message.warning('密码至少6个字符')
    return
  }

  submitting.value = true
  try {
    const data: CreateUserData = {
      username: form.value.username.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
      nickname: form.value.nickname.trim() || undefined
    }

    await createUser(data)
    Message.success('用户创建成功')
    resetForm()
    // 刷新列表
    pagination.value.current = 1
    await loadUserList()
  } catch (error: any) {
    console.error('保存失败:', error)
    Message.error(error?.response?.data?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    password: '',
    nickname: ''
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

// 编辑用户
const handleEdit = (record: UserItem) => {
  editingId.value = record.id
  editForm.value = {
    username: record.username,
    email: record.email,
    password: '',
    nickname: record.nickname || ''
  }
  editModalVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editForm.value.username.trim() || !editForm.value.email.trim()) {
    Message.warning('请填写完整的用户信息')
    return
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(editForm.value.email)) {
    Message.warning('邮箱格式不正确')
    return
  }

  if (editForm.value.password && editForm.value.password.length < 6) {
    Message.warning('密码至少6个字符')
    return
  }

  editSubmitting.value = true
  try {
    const data: any = {
      username: editForm.value.username.trim(),
      email: editForm.value.email.trim(),
      nickname: editForm.value.nickname.trim() || undefined
    }

    // 只有输入了密码才更新
    if (editForm.value.password) {
      data.password = editForm.value.password
    }

    await updateUser(editingId.value, data)
    Message.success('更新成功')
    editModalVisible.value = false
    await loadUserList()
  } catch (error: any) {
    console.error('更新失败:', error)
    Message.error(error?.response?.data?.message || '更新失败')
  } finally {
    editSubmitting.value = false
  }
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

.form-card,
.list-card {
  background: #fff;
}

.text-gray {
  color: var(--color-text-3);
}
</style>
