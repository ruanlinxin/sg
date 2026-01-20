<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-title">关于</h1>
      <p class="muted">这里是路由页面示例。整体风格统一为极简线条分隔。</p>
    </header>

    <section class="line-box block">
      <div class="block-title">说明</div>
      <p class="para">
        左侧为固定侧边栏，右侧为路由页面内容区域。
      </p>
      <div class="line-row row" />
      <p class="para muted">
        你可以在这里继续扩展页面内容与更多路由入口。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-head {
  border: 1px solid var(--line);
  padding: 12px;
}

.page-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.block-title {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
}

.row {
  margin: 2px 0;
}

.para {
  margin: 0;
}
</style>
