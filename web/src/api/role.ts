import request from './request'

export interface RoleItem {
  id: string
  code: string
  name: string
  description?: string
  status: number
  createdAt: string
  updatedAt: string
  users?: {
    id: string
    username: string
    email: string
    nickname?: string
  }[]
}

export interface RoleListResponse {
  list: RoleItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateRoleData {
  code: string
  name: string
  description?: string
  userIds?: string[]
}

export interface UpdateRoleData {
  code?: string
  name?: string
  description?: string
  userIds?: string[]
}

export interface QueryParams {
  page?: number
  pageSize?: number
  keyword?: string
}

// 创建角色
export function createRole(data: CreateRoleData) {
  return request.post('/system/roles', data)
}

// 获取角色列表
export function getRoleList(params: QueryParams = {}) {
  return request.get<RoleListResponse>('/system/roles', { params })
}

// 获取所有角色（简单列表）
export function getRoleSimpleList() {
  return request.get<RoleItem[]>('/system/roles/simple')
}

// 获取角色详情
export function getRoleById(id: string) {
  return request.get<RoleItem>(`/system/roles/${id}`)
}

// 更新角色
export function updateRole(id: string, data: UpdateRoleData) {
  return request.put(`/system/roles/${id}`, data)
}

// 删除角色
export function deleteRole(id: string) {
  return request.delete(`/system/roles/${id}`)
}
