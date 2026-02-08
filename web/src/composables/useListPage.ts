import { ref, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'

export interface PaginationConfig {
  total: number
  current: number
  pageSize: number
  showTotal: boolean
  showJumper: boolean
  showPageSize: boolean
  pageSizeOptions: number[]
}

export interface ListPageOptions<T, Q extends Record<string, any>> {
  title: string
  listApi: (params: Q & { page: number; pageSize: number }) => Promise<any>
  createApi?: (data: any) => Promise<any>
  updateApi?: (id: string, data: any) => Promise<any>
  deleteApi?: (id: string) => Promise<any>
  deleteConfirmText?: (record: T) => string
  defaultFormData: () => any
  transformSubmitData?: (formData: any) => any
  transformEditData?: (record: T) => any
  onSuccess?: (type: 'create' | 'update' | 'delete') => void
}

export function useListPage<T extends { id: string }, Q extends Record<string, any> = {}>(
  options: ListPageOptions<T, Q>
) {
  // 加载状态
  const loading = ref(false)
  const submitting = ref(false)
  const editSubmitting = ref(false)
  const searchLoading = ref(false)

  // 数据列表
  const list = ref<T[]>([])

  // 分页配置
  const pagination = ref<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50]
  })

  // 搜索关键词
  const searchKeyword = ref('')

  // 弹窗状态
  const addModalVisible = ref(false)
  const editModalVisible = ref(false)
  const editingId = ref('')

  // 表单数据
  const form = ref(options.defaultFormData())
  const editForm = ref(options.defaultFormData())

  // 格式化日期
  const formatDate = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm')
  }

  // 加载列表数据
  const loadList = async (extraParams: Q = {} as Q) => {
    loading.value = true
    try {
      const res: any = await options.listApi({
        page: pagination.value.current,
        pageSize: pagination.value.pageSize,
        keyword: searchKeyword.value || undefined,
        ...extraParams
      })
      list.value = res.data.list || []
      pagination.value.total = res.data.total || 0
    } catch (error) {
      console.error('加载列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.value.current = 1
    loadList()
  }

  // 清空搜索
  const handleClearSearch = () => {
    searchKeyword.value = ''
    pagination.value.current = 1
    loadList()
  }

  // 分页切换
  const onPageChange = (current: number) => {
    pagination.value.current = current
    loadList()
  }

  // 打开新增弹窗
  const handleAdd = () => {
    resetForm()
    addModalVisible.value = true
  }

  // 关闭新增弹窗
  const handleAddCancel = () => {
    addModalVisible.value = false
    resetForm()
  }

  // 重置表单
  const resetForm = () => {
    form.value = options.defaultFormData()
  }

  // 提交创建
  const handleSubmit = async (validateFn?: () => boolean | Promise<boolean>) => {
    if (validateFn) {
      const valid = await validateFn()
      if (!valid) return
    }

    submitting.value = true
    try {
      const data = options.transformSubmitData
        ? options.transformSubmitData(form.value)
        : form.value

      await options.createApi!(data)
      Message.success('创建成功')
      addModalVisible.value = false
      resetForm()
      pagination.value.current = 1
      await loadList()
      options.onSuccess?.('create')
    } catch (error: any) {
      console.error('创建失败:', error)
      Message.error(error?.response?.data?.message || '创建失败')
    } finally {
      submitting.value = false
    }
  }

  // 关闭编辑弹窗
  const handleEditCancel = () => {
    editModalVisible.value = false
  }

  // 编辑
  const handleEdit = (record: T) => {
    editingId.value = record.id
    editForm.value = options.transformEditData
      ? options.transformEditData(record)
      : { ...record }
    editModalVisible.value = true
  }

  // 提交编辑
  const handleEditSubmit = async (validateFn?: () => boolean | Promise<boolean>) => {
    if (validateFn) {
      const valid = await validateFn()
      if (!valid) return
    }

    editSubmitting.value = true
    try {
      const data = options.transformSubmitData
        ? options.transformSubmitData(editForm.value)
        : editForm.value

      await options.updateApi!(editingId.value, data)
      Message.success('更新成功')
      editModalVisible.value = false
      await loadList()
      options.onSuccess?.('update')
    } catch (error: any) {
      console.error('更新失败:', error)
      Message.error(error?.response?.data?.message || '更新失败')
    } finally {
      editSubmitting.value = false
    }
  }

  // 删除
  const handleDelete = (record: T) => {
    Modal.confirm({
      title: '确认删除',
      content: options.deleteConfirmText
        ? options.deleteConfirmText(record)
        : '确定要删除该记录吗？',
      okText: '删除',
      okButtonProps: { status: 'danger' },
      onOk: async () => {
        try {
          await options.deleteApi!(record.id)
          Message.success('删除成功')
          await loadList()
          options.onSuccess?.('delete')
        } catch (error) {
          console.error('删除失败:', error)
        }
      }
    })
  }

  // 初始化加载
  onMounted(() => {
    loadList()
  })

  return {
    // 状态
    loading,
    submitting,
    editSubmitting,
    searchLoading,
    list,
    pagination,
    searchKeyword,
    addModalVisible,
    editModalVisible,
    editingId,
    form,
    editForm,

    // 方法
    loadList,
    handleSearch,
    handleClearSearch,
    onPageChange,
    resetForm,
    handleAdd,
    handleAddCancel,
    handleSubmit,
    handleEdit,
    handleEditSubmit,
    handleEditCancel,
    handleDelete,
    formatDate
  }
}
