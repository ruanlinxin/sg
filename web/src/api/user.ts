import request from './request'

export interface UserItem {
  id: string
  username: string
  email: string
  nickname?: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface UserListResponse {
  list: UserItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  nickname?: string
}

export interface UpdateUserData {
  username?: string
  email?: string
  password?: string
  nickname?: string
}

export interface QueryParams {
  page?: number
  pageSize?: number
  keyword?: string
}

// 创建用户
export function createUser(data: CreateUserData) {
  return request.post('/system/users', data)
}

// 获取用户列表
export function getUserList(params: QueryParams = {}) {
  return request.get<UserListResponse>('/system/users', { params })
}

// 获取用户详情
export function getUserById(id: string) {
  return request.get<UserItem>(`/system/users/${id}`)
}

// 更新用户
export function updateUser(id: string, data: UpdateUserData) {
  return request.put(`/system/users/${id}`, data)
}

// 删除用户
export function deleteUser(id: string) {
  return request.delete(`/system/users/${id}`)
}
