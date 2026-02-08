<template>
  <div class="page">
    <a-typography-title :heading="4">角色管理</a-typography-title>

    <!-- 录入表单 -->
    <a-card title="录入新角色" class="form-card">
      <a-form :model="form" @submit="handleSubmit" auto-label-width>
        <a-form-item field="code" label="角色编码" required>
          <a-input
            v-model="form.code"
            placeholder="请输入角色编码，如：admin"
            allow-clear
          />
        </a-form-item>

        <a-form-item field="name" label="角色名称" required>
          <a-input
            v-model="form.name"
            placeholder="请输入角色名称"
            allow-clear
          />
        </a-form-item>

        <a-form-item field="description" label="角色描述">
          <a-textarea
            v-model="form.description"
            placeholder="可选：输入角色描述"
            :auto-size="{ minRows: 2, maxRows: 4 }"
            allow-clear
          />
        </a-form-item>

        <a-form-item field="userIds" label="关联用户">
          <a-select
            v-model="form.userIds"
            placeholder="请选择关联用户"
            multiple
            :loading="userLoading"
            allow-clear
          >
            <a-option
              v-for="user in userList"
              :key="user.id"
              :value="user.id"
              :label="user.username"
            >
              {{ user.username }} ({{ user.email }})
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="submitting">
              保存角色
            </a-button>
            <a-button @click="resetForm">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 角色列表 -->
    <a-card title="角色列表" class="list-card">
      <a-space direction="vertical" fill>
        <!-- 搜索栏 -->
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索角色名称"
          search-button
          :loading="searchLoading"
          @search="handleSearch"
          @clear="handleClearSearch"
          allow-clear
        />

        <a-table
          :data="roleList"
          :loading="loading"
          :pagination="pagination"
          @page-change="onPageChange"
          stripe
        >
          <template #columns>
            <a-table-column title="ID" data-index="id" width="200" ellipsis tooltip />
            <a-table-column title="角色编码" data-index="code" width="120" />
            <a-table-column title="角色名称" data-index="name" />
            <a-table-column title="描述" data-index="description">
              <template #cell="{ record }">
                {{ record.description || '-' }}
              </template>
            </a-table-column>
            <a-table-column title="关联用户" width="200">
              <template #cell="{ record }">
                <a-space wrap>
                  <a-tag
                    v-for="user in record.users?.slice(0, 2)"
                    :key="user.id"
                    color="arcoblue"
                    size="small"
                  >
                    {{ user.username }}
                  </a-tag>
                  <a-tag v-if="(record.users?.length || 0) > 2" size="small">
                    +{{ record.users.length - 2 }}
                  </a-tag>
                  <span v-if="!record.users?.length" class="text-gray">-</span>
                </a-space>
              </template>
            </a-table-column>
            <a-table-column title="创建时间" data-index="createdAt" width="160">
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
      title="编辑角色"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
      :ok-loading="editSubmitting"
      unmount-on-close
    >
      <a-form :model="editForm" auto-label-width>
        <a-form-item field="code" label="角色编码" required>
          <a-input
            v-model="editForm.code"
            placeholder="请输入角色编码"
          />
        </a-form-item>

        <a-form-item field="name" label="角色名称" required>
          <a-input
            v-model="editForm.name"
            placeholder="请输入角色名称"
          />
        </a-form-item>

        <a-form-item field="description" label="角色描述">
          <a-textarea
            v-model="editForm.description"
            placeholder="可选：输入角色描述"
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>

        <a-form-item field="userIds" label="关联用户">
          <a-select
            v-model="editForm.userIds"
            placeholder="请选择关联用户"
            multiple
            :loading="userLoading"
            allow-clear
          >
            <a-option
              v-for="user in userList"
              :key="user.id"
              :value="user.id"
              :label="user.username"
            >
              {{ user.username }} ({{ user.email }})
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import {
  createRole,
  getRoleList,
  updateRole,
  deleteRole,
  type RoleItem,
  type CreateRoleData
} from '@/api/role'
import { getUserList, type UserItem } from '@/api/user'

// 表单数据
interface RoleForm {
  code: string
  name: string
  description: string
  userIds: string[]
}

const form = ref<RoleForm>({
  code: '',
  name: '',
  description: '',
  userIds: []
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

// 角色列表
const roleList = ref<RoleItem[]>([])

// 用户列表（用于下拉选择）
const userList = ref<UserItem[]>([])
const userLoading = ref(false)

// 编辑相关
const editModalVisible = ref(false)
const editSubmitting = ref(false)
const editingId = ref('')
const editForm = ref<RoleForm>({
  code: '',
  name: '',
  description: '',
  userIds: []
})

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 加载角色列表
const loadRoleList = async () => {
  loading.value = true
  try {
    const res: any = await getRoleList({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      keyword: searchKeyword.value || undefined
    })
    roleList.value = res.data.list || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载用户列表
const loadUserList = async () => {
  userLoading.value = true
  try {
    const res: any = await getUserList({ page: 1, pageSize: 1000 })
    userList.value = res.data.list || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    userLoading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.code.trim() || !form.value.name.trim()) {
    Message.warning('请填写角色编码和名称')
    return
  }

  submitting.value = true
  try {
    const data: CreateRoleData = {
      code: form.value.code.trim(),
      name: form.value.name.trim(),
      description: form.value.description.trim() || undefined,
      userIds: form.value.userIds.length > 0 ? form.value.userIds : undefined
    }

    await createRole(data)
    Message.success('角色创建成功')
    resetForm()
    pagination.value.current = 1
    await loadRoleList()
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
    code: '',
    name: '',
    description: '',
    userIds: []
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadRoleList()
}

// 清空搜索
const handleClearSearch = () => {
  searchKeyword.value = ''
  pagination.value.current = 1
  loadRoleList()
}

// 分页切换
const onPageChange = (current: number) => {
  pagination.value.current = current
  loadRoleList()
}

// 编辑角色
const handleEdit = (record: RoleItem) => {
  editingId.value = record.id
  editForm.value = {
    code: record.code,
    name: record.name,
    description: record.description || '',
    userIds: record.users?.map(u => u.id) || []
  }
  editModalVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editForm.value.code.trim() || !editForm.value.name.trim()) {
    Message.warning('请填写角色编码和名称')
    return
  }

  editSubmitting.value = true
  try {
    const data: any = {
      code: editForm.value.code.trim(),
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim() || undefined,
      userIds: editForm.value.userIds
    }

    await updateRole(editingId.value, data)
    Message.success('更新成功')
    editModalVisible.value = false
    await loadRoleList()
  } catch (error: any) {
    console.error('更新失败:', error)
    Message.error(error?.response?.data?.message || '更新失败')
  } finally {
    editSubmitting.value = false
  }
}

// 删除角色
const handleDelete = (record: RoleItem) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除角色 "${record.name}" 吗？`,
    okText: '删除',
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      try {
        await deleteRole(record.id)
        Message.success('删除成功')
        await loadRoleList()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  })
}

// 初始化加载
onMounted(() => {
  loadRoleList()
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
