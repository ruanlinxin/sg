<template>
  <a-modal
    v-model:visible="visible"
    :title="isEdit ? '编辑题目' : '新增题目'"
    :ok-loading="submitting"
    @ok="handleSubmit"
    @cancel="handleCancel"
    unmount-on-close
  >
    <a-form ref="formRef" :model="formData" auto-label-width>
      <a-form-item
        field="question"
        label="题目"
        :rules="[{ required: true, message: '请输入题目内容' }]"
      >
        <a-textarea
          v-model="formData.question"
          placeholder="请输入题目内容"
          :auto-size="{ minRows: 2, maxRows: 4 }"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        field="answer"
        label="答案"
        :rules="[{ required: true, message: '请输入答案内容' }]"
      >
        <a-textarea
          v-model="formData.answer"
          placeholder="请输入答案内容"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="indexes" label="索引">
        <a-input
          v-model="formData.indexes"
          placeholder="可选：输入索引关键词"
          allow-clear
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { createQuestion, updateQuestion, type QuestionItem } from '@/api/question'

interface FormData {
  question: string
  answer: string
  indexes: string
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
  question: '',
  answer: '',
  indexes: ''
})

// 打开弹窗（新增）
function open() {
  editingId.value = ''
  formData.value = {
    question: '',
    answer: '',
    indexes: ''
  }
  visible.value = true
}

// 打开弹窗（编辑）
function openEdit(record: QuestionItem) {
  editingId.value = record.id
  formData.value = {
    question: record.question,
    answer: record.answer,
    indexes: record.indexes || ''
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
      question: formData.value.question.trim(),
      answer: formData.value.answer.trim(),
      indexes: formData.value.indexes.trim() || undefined
    }

    if (isEdit.value && editingId.value) {
      await updateQuestion(editingId.value, data)
      Message.success('更新成功')
    } else {
      await createQuestion(data)
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
