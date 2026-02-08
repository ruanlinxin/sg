<template>
  <ListPage
    v-bind="listPage"
    title="用户管理"
    form-title="录入新用户"
    list-title="用户列表"
    submit-text="保存用户"
    search-placeholder="搜索用户名"
    edit-title="编辑用户"
    @submit="handleSubmit"
    @reset="resetForm"
    @search="handleSearch"
    @clear-search="handleClearSearch"
    @page-change="onPageChange"
    @edit="handleEdit"
    @delete="handleDelete"
    @edit-submit="handleEditSubmit"
  >
    <!-- 表单字段 -->
    <template #form-items="{ form }">
      <a-form-item field="username" label="用户名" required>
        <a-input v-model="form.username" placeholder="请输入用户名" allow-clear />
      </a-form-item>

      <a-form-item field="email" label="邮箱" required>
        <a-input v-model="form.email" placeholder="请输入邮箱" allow-clear />
      </a-form-item>

      <a-form-item field="password" label="密码" required>
        <a-input-password v-model="form.password" placeholder="请输入密码（至少6位）" allow-clear />
      </a-form-item>

      <a-form-item field="nickname" label="昵称">
        <a-input v-model="form.nickname" placeholder="可选：输入昵称" allow-clear />
      </a-form-item>
    </template>

    <!-- 表格列 -->
    <template #columns="{ formatDate }">
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
    </template>

    <!-- 编辑表单字段 -->
    <template #edit-form-items="{ form }">
      <a-form-item field="username" label="用户名" required>
        <a-input v-model="form.username" placeholder="请输入用户名" />
      </a-form-item>

      <a-form-item field="email" label="邮箱" required>
        <a-input v-model="form.email" placeholder="请输入邮箱" />
      </a-form-item>

      <a-form-item field="password" label="密码">
        <a-input-password v-model="form.password" placeholder="不修改请留空" />
      </a-form-item>

      <a-form-item field="nickname" label="昵称">
        <a-input v-model="form.nickname" placeholder="可选：输入昵称" />
      </a-form-item>
    </template>
  </ListPage>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import ListPage from '@/components/list-page/index.vue'
import { useListPage } from '@/composables/useListPage'
import {
  createUser,
  getUserList,
  updateUser,
  deleteUser,
  type UserItem
} from '@/api/user'

const defaultFormData = () => ({
  username: '',
  email: '',
  password: '',
  nickname: ''
})

const listPage = useListPage<UserItem>({
  title: '用户管理',
  listApi: getUserList,
  createApi: createUser,
  updateApi: updateUser,
  deleteApi: deleteUser,
  defaultFormData,
  transformSubmitData: (formData) => ({
    username: formData.username.trim(),
    email: formData.email.trim(),
    password: formData.password,
    nickname: formData.nickname.trim() || undefined
  }),
  transformEditData: (record) => ({
    username: record.username,
    email: record.email,
    password: '',
    nickname: record.nickname || ''
  }),
  deleteConfirmText: (record) => `确定要删除用户 "${record.username}" 吗？`
})

// 验证并提交
const handleSubmit = async () => {
  const form = listPage.form.value
  if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
    Message.warning('请填写完整的用户信息')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    Message.warning('邮箱格式不正确')
    return
  }

  if (form.password.length < 6) {
    Message.warning('密码至少6个字符')
    return
  }

  await listPage.handleSubmit()
}

const handleEditSubmit = async () => {
  const form = listPage.editForm.value
  if (!form.username.trim() || !form.email.trim()) {
    Message.warning('请填写完整的用户信息')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    Message.warning('邮箱格式不正确')
    return
  }

  if (form.password && form.password.length < 6) {
    Message.warning('密码至少6个字符')
    return
  }

  // 构建更新数据
  const data: any = {
    username: form.username.trim(),
    email: form.email.trim(),
    nickname: form.nickname.trim() || undefined
  }
  if (form.password) {
    data.password = form.password
  }
  listPage.editForm.value = data

  await listPage.handleEditSubmit()
}
</script>

<style scoped>
.text-gray {
  color: var(--color-text-3);
}
</style>
