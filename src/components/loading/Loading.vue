<template>
  <div class="wrap" :data-overlay="overlay ? 'true' : 'false'" role="status" aria-live="polite">
    <div class="box">
      <span class="spinner" />
      <span v-if="text" class="text">{{ text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  text?: string
  overlay?: boolean
}>(), {
  text: '加载中…',
  overlay: false
})
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.wrap[data-overlay='true'] {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(2px);
}

.box {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  padding: 10px 12px;
  background: #fff;
}

.spinner {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid rgba(30, 30, 30, 0.18);
  border-top-color: rgba(30, 30, 30, 0.72);
  animation: spin 0.9s linear infinite;
}

.text {
  font-size: 12px;
  opacity: 0.75;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

