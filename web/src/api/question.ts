import request from './request'

export interface QuestionItem {
  id: string
  question: string
  answer: string
  indexes?: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface QuestionListResponse {
  list: QuestionItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateQuestionData {
  question: string
  answer: string
  indexes?: string
}

export interface UpdateQuestionData {
  question?: string
  answer?: string
  indexes?: string
}

export interface QueryParams {
  page?: number
  pageSize?: number
  keyword?: string
}

// 创建题目
export function createQuestion(data: CreateQuestionData) {
  return request.post('/questions', data)
}

// 获取题目列表
export function getQuestionList(params: QueryParams = {}) {
  return request.get<QuestionListResponse>('/questions', { params })
}

// 获取题目详情
export function getQuestionById(id: string) {
  return request.get<QuestionItem>(`/questions/${id}`)
}

// 更新题目
export function updateQuestion(id: string, data: UpdateQuestionData) {
  return request.put(`/questions/${id}`, data)
}

// 删除题目
export function deleteQuestion(id: string) {
  return request.delete(`/questions/${id}`)
}

// 同步外部题目数据
export function syncQuestions() {
  return request.post<{
    total: number
    added: number
    skipped: number
  }>('/questions/sync')
}

// 获取所有题目（不分页，用于前端缓存）
export function getAllQuestions() {
  return request.get<Pick<QuestionItem, 'question' | 'answer' | 'indexes'>[]>('/questions/all')
}
