<template>
  <div class="loading-indicator">
    <v-progress-circular :size="size" :width="width" color="primary" indeterminate class="mb-4" />
    <div class="text-h6 mb-2">{{ title }}</div>
    <div v-if="subtitle" class="text-body-2 text-medium-emphasis">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
  size?: number;
  width?: number;
}

withDefaults(defineProps<Props>(), {
  title: 'Loading...',
  subtitle: '',
  size: 40,
  width: 4,
});
</script>
