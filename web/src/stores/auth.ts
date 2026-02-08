import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, getProfile, type LoginData, type RegisterData, type UserInfo } from '@/api/auth'

const TOKEN_KEY = 'sg_token'
const USER_KEY = 'sg_user'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref<UserInfo | null>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const loading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const username = computed(() => user.value?.username || '')
  const nickname = computed(() => user.value?.nickname || user.value?.username || '')
  const isAdmin = computed(() => {
    if (!user.value?.roles) return false
    return user.value.roles.some(role => role.code === 'admin')
  })

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  const setUser = (newUser: UserInfo) => {
    user.value = newUser
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  const clearAuth = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const loginAction = async (data: LoginData) => {
    loading.value = true
    try {
      const res: any = await login(data)
      setToken(res.data.token)
      setUser(res.data.user)
      return true
    } catch (error: any) {
      console.error('登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const registerAction = async (data: RegisterData) => {
    loading.value = true
    try {
      const res: any = await register(data)
      setToken(res.data.token)
      setUser(res.data.user)
      return true
    } catch (error: any) {
      console.error('注册失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchUserProfile = async () => {
    if (!token.value) return
    try {
      const res: any = await getProfile()
      setUser(res.data)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      clearAuth()
    }
  }

  const logout = () => {
    clearAuth()
  }

  // 初始化时如果有token，获取用户信息
  const init = async () => {
    if (token.value) {
      await fetchUserProfile()
    }
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    username,
    nickname,
    isAdmin,
    setToken,
    setUser,
    clearAuth,
    loginAction,
    registerAction,
    fetchUserProfile,
    logout,
    init,
  }
})
