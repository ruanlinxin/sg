<template>
  <div class="page">
    <div class="title">更新日志</div>

    <Tabs v-model="activeTab" :tabs="tabs" />

    <div v-if="activeTab === 'plan'" class="card">
      <div class="card-title">更新计划</div>
      <ul class="list">
        <li>补齐表格统计页面的业务逻辑</li>
        <li>完善更新日志格式与自动生成</li>
      </ul>
    </div>

    <div v-else class="card">
      <div class="card-title">更新记录</div>
      <div class="record">
        <div class="record-ver">v0.0.0</div>
        <ul class="list">
          <li>初始化页面</li>
          <li>新增表格统计页（Univer 渲染）</li>
          <li>新增更新日志页</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tabs, type TabItem, type TabKey } from '@/components'

const tabs: TabItem[] = [
  { key: 'plan', label: '计划更新' },
  { key: 'records', label: '更新记录' }
]

const activeTab = ref<TabKey>('plan')
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title {
  font-size: 16px;
  font-weight: 700;
}

.desc {
  font-size: 12px;
}

.card {
  border: 1px solid var(--line);
  padding: 12px;
}

.card-title {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
}

.record {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-ver {
  font-size: 12px;
  opacity: 0.75;
}
</style>
