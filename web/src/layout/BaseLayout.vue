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
          <template #icon><icon-home /></template>
          首页
        </a-menu-item>
        <a-menu-item key="table-stats">
          <template #icon><icon-calendar /></template>
          表格统计
        </a-menu-item>
        <a-menu-item key="changelog">
          <template #icon><icon-history /></template>
          更新日志
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout class="layout-main">
      <a-layout-content class="layout-content">
        <RouterView />
      </a-layout-content>

      <a-layout-footer class="layout-footer">
        <div class="beian">
          <!-- 备案号区域，手动填充 -->
          <span class="beian-text">备案号：浙ICP备2026005933号</span>
        </div>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { IconHome, IconCalendar, IconHistory } from '@arco-design/web-vue/es/icon'

const route = useRoute()
const router = useRouter()

const handleMenuClick = (key: string) => {
  const pathMap: Record<string, string> = {
    home: '/',
    'table-stats': '/table-stats',
    changelog: '/changelog'
  }
  router.push(pathMap[key] || '/')
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.layout-sider {
  background: #fff;
  border-right: 1px solid var(--color-border);
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
</style>
