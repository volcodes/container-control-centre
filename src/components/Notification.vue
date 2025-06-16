<template>
  <v-snackbar
    v-if="showSnackbar"
    v-model="showSnackbar"
    :color="snackbarColor"
    :timeout="snackbarTimeout"
    location="top"
    class="snackbar-manager"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">{{ snackbarIcon }}</v-icon>
      <span>{{ snackbarText }}</span>
    </div>
    <template #actions>
      <v-btn icon="mdi-close" size="small" variant="text" @click="store.hideSnackbar" />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimeslotStore } from '../stores/timeslot';

const store = useTimeslotStore();

const snackbarText = computed(() => store.snackbarMessage?.message || '');
const snackbarTimeout = computed(() => store.snackbarMessage?.timeout || 5000);
const showSnackbar = computed({
  get: () => !!store.snackbarMessage,
  set: (value: boolean) => {
    if (!value) {
      store.hideSnackbar();
    }
  },
});
const snackbarColor = computed(() => {
  const type = store.snackbarMessage?.type || 'info';
  const colorMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };
  return colorMap[type];
});
const snackbarIcon = computed(() => {
  const type = store.snackbarMessage?.type || 'info';
  const iconMap = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
  };
  return iconMap[type];
});
</script>
