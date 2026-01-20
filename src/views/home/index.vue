<template>
  <div class="page">
    <section class="line-box block">
      <QaSearch />
    </section>

    <Calendar />
  </div>
</template>

<script setup lang="ts">
import QaSearch from './query/QaSearch.vue'
import Calendar from './components/Calendar.vue'
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
</style>
