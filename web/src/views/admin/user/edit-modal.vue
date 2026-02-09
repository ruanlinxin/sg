<template>
  <a-modal
    v-model:visible="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    :ok-loading="submitting"
    @ok="handleSubmit"
    @cancel="handleCancel"
    unmount-on-close
  >
    <a-form ref="formRef" :model="formData" auto-label-width>
      <a-form-item
        field="username"
        label="用户名"
        :rules="[{ required: true, message: '请输入用户名' }]"
      >
        <a-input
          v-model="formData.username"
          placeholder="请输入用户名"
          allow-clear
          :disabled="isEdit"
        />
      </a-form-item>

      <a-form-item
        field="email"
        label="邮箱"
        :rules="[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '邮箱格式不正确' }
        ]"
      >
        <a-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        field="password"
        label="密码"
        :rules="isEdit ? [] : [{ required: true, message: '请输入密码' }]"
      >
        <a-input-password
          v-model="formData.password"
          :placeholder="isEdit ? '不修改请留空' : '请输入密码（至少6位）'"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="nickname" label="昵称">
        <a-input
          v-model="formData.nickname"
          placeholder="可选：输入昵称"
          allow-clear
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { createUser, updateUser, type UserItem } from '@/api/user'

interface FormData {
  username: string
  email: string
  password: string
  nickname: string
}

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<any>(null)
const editingId = ref('')
const isEdit = computed(() => !!editingId.value)

const formData = ref<FormData>({
  username: '',
  email: '',
  password: '',
  nickname: ''
})

// 打开弹窗（新增）
function open() {
  editingId.value = ''
  formData.value = {
    username: '',
    email: '',
    password: '',
    nickname: ''
  }
  visible.value = true
}

// 打开弹窗（编辑）
function openEdit(record: UserItem) {
  editingId.value = record.id
  formData.value = {
    username: record.username,
    email: record.email,
    password: '',
    nickname: record.nickname || ''
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
    const data: any = {
      username: formData.value.username.trim(),
      email: formData.value.email.trim(),
      nickname: formData.value.nickname.trim() || undefined
    }

    if (isEdit.value && editingId.value) {
      // 编辑模式
      if (formData.value.password) {
        data.password = formData.value.password
      }
      await updateUser(editingId.value, data)
      Message.success('更新成功')
    } else {
      // 新增模式
      data.password = formData.value.password
      await createUser(data)
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
