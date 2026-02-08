<template>
  <div class="page">
    <a-card class="search-card" :bordered="false">
      <QaSearch />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import QaSearch from './query/QaSearch.vue'
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card {
  background: transparent;
}
</style>
