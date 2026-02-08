<template>
  <a-layout class="layout">
    <a-layout-sider
      :width="240"
      breakpoint="lg"
      collapsible
      :default-collapsed="false"
      hide-trigger
      class="layout-sider"
    >
      <div class="logo">
        <span class="logo-text">SG Game</span>
      </div>
      <a-menu
        :selected-keys="[route.name as string]"
        @menu-item-click="handleMenuClick"
      >
        <a-menu-item key="home">
          <template #icon><IconHome /></template>
          首页
        </a-menu-item>
        <a-menu-item key="table-stats">
          <template #icon><IconCalendar /></template>
          表格统计
        </a-menu-item>
        <a-menu-item key="changelog">
          <template #icon><IconHistory /></template>
          更新日志
        </a-menu-item>
        <template v-if="authStore.isAdmin">
          <a-sub-menu key="admin" >
            <template #icon><IconSettings /></template>
            <template #title>后台</template>
            <a-menu-item key="admin-question">题目管理</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="system">
            <template #icon><IconSafe /></template>
            <template #title>系统管理</template>
            <a-menu-item key="admin-user">用户管理</a-menu-item>
            <a-menu-item key="admin-role">角色管理</a-menu-item>
          </a-sub-menu>
        </template>
      </a-menu>

      <!-- 用户按钮 -->
      <div class="user-section">
        <a-trigger
          v-if="authStore.isLoggedIn"
          trigger="hover"
          position="top"
          :popup-translate="[0, -10]"
        >
          <a-button type="text" class="user-btn">
            <template #icon>
              <IconUser class="user-icon" />
            </template>
          </a-button>
          <template #content>
            <div class="user-popup">
              <div class="user-name">{{ authStore.nickname }}</div>
              <a-divider style="margin: 8px 0" />
              <a-button type="text" status="danger" long @click="handleLogout">
                退出登录
              </a-button>
            </div>
          </template>
        </a-trigger>
        <a-button v-else type="text" class="user-btn" @click="showLoginModal = true">
          <template #icon>
            <IconUser class="user-icon" />
          </template>
        </a-button>
      </div>
    </a-layout-sider>

    <a-layout class="layout-main">
      <a-layout-content class="layout-content">
        <RouterView />
      </a-layout-content>

      <a-layout-footer class="layout-footer">
        <div class="beian">
          <span class="beian-text">备案号：浙ICP备2026005933号</span>
        </div>
      </a-layout-footer>
    </a-layout>
  </a-layout>

  <!-- 登录/注册弹窗 -->
  <a-modal
    v-model:visible="showLoginModal"
    :title="isRegister ? '注册' : '登录'"
    :footer="false"
    width="400px"
    unmount-on-close
    @cancel="resetForm"
  >
    <a-form :model="form" @submit="handleSubmit" layout="vertical">
      <a-form-item field="username" label="用户名" required>
        <a-input
          v-model="form.username"
          placeholder="请输入用户名"
          allow-clear
        />
      </a-form-item>

      <a-form-item v-if="isRegister" field="email" label="邮箱" required>
        <a-input
          v-model="form.email"
          placeholder="请输入邮箱"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="password" label="密码" required>
        <a-input-password
          v-model="form.password"
          placeholder="请输入密码"
          allow-clear
        />
      </a-form-item>

      <a-form-item v-if="isRegister" field="confirmPassword" label="确认密码" required>
        <a-input-password
          v-model="form.confirmPassword"
          placeholder="请再次输入密码"
          allow-clear
        />
      </a-form-item>

      <a-form-item v-if="isRegister" field="nickname" label="昵称">
        <a-input
          v-model="form.nickname"
          placeholder="可选：输入昵称"
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="authStore.loading" long>
          {{ isRegister ? '注册' : '登录' }}
        </a-button>
      </a-form-item>

      <div class="form-footer">
        <a-button type="text" @click="toggleMode">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { IconHome, IconCalendar, IconHistory, IconSettings, IconUser, IconSafe } from '@arco-design/web-vue/es/icon'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showLoginModal = ref(false)
const isRegister = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  nickname: ''
})

const handleMenuClick = (key: string) => {
  const pathMap: Record<string, string> = {
    home: '/',
    'table-stats': '/table-stats',
    changelog: '/changelog',
    'admin-question': '/admin/question',
    'admin-user': '/admin/user',
    'admin-role': '/admin/role'
  }
  router.push(pathMap[key] || '/')
}

const toggleMode = () => {
  isRegister.value = !isRegister.value
  resetForm()
}

const resetForm = () => {
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.nickname = ''
}

const handleSubmit = async () => {
  if (!form.username.trim() || !form.password.trim()) {
    Message.warning('请填写用户名和密码')
    return
  }

  if (isRegister.value) {
    if (!form.email.trim()) {
      Message.warning('请填写邮箱')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      Message.warning('邮箱格式不正确')
      return
    }
    if (form.password !== form.confirmPassword) {
      Message.warning('两次输入的密码不一致')
      return
    }
    if (form.password.length < 6) {
      Message.warning('密码至少6个字符')
      return
    }

    try {
      await authStore.registerAction({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        nickname: form.nickname.trim() || undefined
      })
      Message.success('注册成功')
      showLoginModal.value = false
      resetForm()
    } catch (error: any) {
      Message.error(error?.response?.data?.message || '注册失败')
    }
  } else {
    try {
      await authStore.loginAction({
        username: form.username.trim(),
        password: form.password
      })
      Message.success('登录成功')
      showLoginModal.value = false
      resetForm()
    } catch (error: any) {
      Message.error(error?.response?.data?.message || '用户名或密码错误')
    }
  }
}

const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    onOk: () => {
      authStore.logout()
      Message.success('已退出登录')
    }
  })
}

onMounted(() => {
  authStore.init()
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.layout-sider {
  background: #fff;
  border-right: 1px solid var(--color-border);
  position: relative;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--color-border);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

.layout-main {
  background: var(--color-fill-2);
}

.layout-content {
  padding: 16px;
  margin: 16px;
  background: #fff;
  border-radius: 4px;
}

.layout-footer {
  padding: 16px;
  background: transparent;
  text-align: center;
}

.beian {
  color: var(--color-text-3);
  font-size: 12px;
}

.beian-text {
  /* 备案号样式，可根据需要修改 */
}

/* 用户按钮样式 */
.user-section {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
}

.user-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-fill-2);
  transition: all 0.3s;
}

.user-btn:hover {
  background: var(--color-fill-3);
}

.user-icon {
  font-size: 20px;
  color: var(--color-text-2);
}

/* 用户悬浮卡片 */
.user-popup {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 140px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
  text-align: center;
}

.form-footer {
  text-align: center;
  margin-top: 8px;
}
</style>
