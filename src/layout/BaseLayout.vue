<template>
  <div class="app-shell">
    <aside class="app-side" aria-label="侧边栏">
      <MenuTree :items="menuItems" />

      <!-- <div class="side-foot">
        <div class="side-foot-line" />
        <div class="side-foot-text">极简线条布局</div>
      </div> -->
    </aside>

    <main class="app-main" aria-label="页面内容">
      <RouterView />
      
    </main>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '../components'
import { MenuTree } from '../components'

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: '首页',
    to: '/'
  },
  {
    id: 'game-settings',
    label: '游戏设定',
    to: '/game-settings'
  }
]
</script>

<style scoped>
.app-shell {
  --side-w: 240px;
  --pad: 12px;
  --pad-lg: 16px;
}

.app-side {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--side-w);
  border-right: 1px solid var(--line);
  padding: var(--pad);
  display: flex;
  flex-direction: column;
  gap: var(--pad);
  background: #fff;
  overflow: auto;
}

.side-foot {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.side-foot-line {
  height: 1px;
  background: var(--line);
}

.side-foot-text {
  font-size: 12px;
  opacity: 0.75;
}

.app-main {
  margin-left: var(--side-w);
  min-height: 100vh;
  padding: var(--pad-lg);
  background: #fff;
}

@media (max-width: 720px) {
  .app-side {
    position: static;
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .app-main {
    margin-left: 0;
  }
}
</style>
