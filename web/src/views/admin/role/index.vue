<template>
  <div class="page">
    <div class="page-header">
      <a-typography-title :heading="4">角色管理</a-typography-title>
      <a-button type="primary" @click="handleAdd">
        <template #icon><icon-plus /></template>
        新增角色
      </a-button>
    </div>

    <!-- 角色列表 -->
    <a-card class="list-card">
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

    <!-- 新增/编辑弹窗 -->
    <edit-modal
      ref="editModalRef"
      :user-list="userList"
      :user-loading="userLoading"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import {
  getRoleList,
  deleteRole,
  type RoleItem
} from '@/api/role'
import { getUserList, type UserItem } from '@/api/user'
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

// 角色列表
const loading = ref(false)
const roleList = ref<RoleItem[]>([])

// 用户列表（用于下拉选择）
const userList = ref<UserItem[]>([])
const userLoading = ref(false)

// 弹窗引用
const editModalRef = ref<InstanceType<typeof EditModal> | null>(null)

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

// 新增角色
const handleAdd = () => {
  editModalRef.value?.open()
}

// 编辑角色
const handleEdit = (record: RoleItem) => {
  editModalRef.value?.openEdit(record)
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

// 操作成功回调
const handleSuccess = () => {
  pagination.value.current = 1
  loadRoleList()
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
