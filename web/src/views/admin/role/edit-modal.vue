<template>
  <a-modal
    v-model:visible="visible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    :ok-loading="submitting"
    @ok="handleSubmit"
    @cancel="handleCancel"
    unmount-on-close
  >
    <a-form ref="formRef" :model="formData" auto-label-width>
      <a-form-item
        field="code"
        label="角色编码"
        :rules="[{ required: true, message: '请输入角色编码' }]"
      >
        <a-input
          v-model="formData.code"
          placeholder="请输入角色编码，如：admin"
          allow-clear
          :disabled="isEdit"
        />
      </a-form-item>

      <a-form-item
        field="name"
        label="角色名称"
        :rules="[{ required: true, message: '请输入角色名称' }]"
      >
        <a-input
          v-model="formData.name"
          placeholder="请输入角色名称"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="description" label="角色描述">
        <a-textarea
          v-model="formData.description"
          placeholder="可选：输入角色描述"
          :auto-size="{ minRows: 2, maxRows: 4 }"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="userIds" label="关联用户">
        <a-select
          v-model="formData.userIds"
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { createRole, updateRole, type RoleItem } from '@/api/role'
import type { UserItem } from '@/api/user'

interface FormData {
  code: string
  name: string
  description: string
  userIds: string[]
}

interface Props {
  userList: UserItem[]
  userLoading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<any>(null)
const editingId = ref('')
const isEdit = computed(() => !!editingId.value)

const formData = ref<FormData>({
  code: '',
  name: '',
  description: '',
  userIds: []
})

// 打开弹窗（新增）
function open() {
  editingId.value = ''
  formData.value = {
    code: '',
    name: '',
    description: '',
    userIds: []
  }
  visible.value = true
}

// 打开弹窗（编辑）
function openEdit(record: RoleItem) {
  editingId.value = record.id
  formData.value = {
    code: record.code,
    name: record.name,
    description: record.description || '',
    userIds: record.users?.map(u => u.id) || []
  }
  visible.value = true
}

// 关闭弹窗
function handleCancel() {
  visible.value = false
}

// 提交表单
async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (valid) return

  submitting.value = true
  try {
    const data = {
      code: formData.value.code.trim(),
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || undefined,
      userIds: formData.value.userIds.length > 0 ? formData.value.userIds : undefined
    }

    if (isEdit.value && editingId.value) {
      await updateRole(editingId.value, data)
      Message.success('更新成功')
    } else {
      await createRole(data)
      Message.success('创建成功')
    }

    emit('success')
    visible.value = false
  } catch (error: any) {
    Message.error(error?.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open,
  openEdit
})
</script>
