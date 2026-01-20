<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-title">游戏设定</h1>
      <p class="muted">这里放置游戏相关的基础配置项。</p>
    </header>

    <section class="line-box block">
      <div class="block-title">占位</div>
      <p class="para muted">后续可添加：音量、画质、按键映射、语言等。</p>
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

.para {
  margin: 0;
}
</style>
