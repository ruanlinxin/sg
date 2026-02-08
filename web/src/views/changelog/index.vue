<template>
  <div class="page">
    <a-typography-title :heading="4">更新日志</a-typography-title>

    <a-tabs v-model:active-key="activeTab" class="changelog-tabs">
      <a-tab-pane key="plan" title="计划更新">
        <a-card :bordered="true" class="changelog-card">
          <a-typography-title :heading="6">更新计划</a-typography-title>
          <a-list :bordered="false">
            <a-list-item>补齐表格统计页面的业务逻辑</a-list-item>
            <a-list-item>完善更新日志格式与自动生成</a-list-item>
          </a-list>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="records" title="更新记录">
        <a-card :bordered="true" class="changelog-card">
          <a-typography-title :heading="6">更新记录</a-typography-title>
          <a-timeline>
            <a-timeline-item label="2025-02-08" line-type="dashed">
              <a-space direction="vertical" fill>
                <a-tag color="arcoblue">v0.0.0</a-tag>
                <a-list :bordered="false" size="small">
                  <a-list-item>初始化页面</a-list-item>
                  <a-list-item>新增表格统计页（Univer 渲染）</a-list-item>
                  <a-list-item>新增更新日志页</a-list-item>
                  <a-list-item>引入 Arco Design 组件库重构 UI</a-list-item>
                </a-list>
              </a-space>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
type TabKey = 'plan' | 'records'

const activeTab = ref<TabKey>('plan')
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.changelog-tabs :deep(.arco-tabs-content) {
  padding-top: 16px;
}

.changelog-card {
  background: #fff;
}
</style>
