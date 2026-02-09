import request from './request'

export interface RoleInfo {
  id: string
  code: string
  name: string
}

export interface UserInfo {
  id: string
  username: string
  email: string
  nickname?: string
  roles?: RoleInfo[]
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  nickname?: string
}

export interface AuthResponse {
  token: string
  user: UserInfo
}

// 登录
export function login(data: LoginData) {
  return request.post<AuthResponse>('/system/auth/login', data)
}

// 注册
export function register(data: RegisterData) {
  return request.post<AuthResponse>('/system/auth/register', data)
}

// 获取当前用户信息
export function getProfile() {
  return request.get<UserInfo>('/system/auth/profile')
}
