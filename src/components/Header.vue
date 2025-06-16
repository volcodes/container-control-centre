<template>
  <v-app-bar color="darkBlueV2" elevation="0" class="pr-1">
    <v-app-bar-title class="d-flex align-center text-white">
      <span class="font-weight-bold"> Container Control Centre </span>
    </v-app-bar-title>

    <div class="d-flex align-center">
      <v-btn v-if="!store.sseConnected" icon="mdi-refresh" size="small" color="red" @click="emit('reconnect')" />
      <v-chip
        :color="connectionStatusColor"
        :variant="connectionStatusVariant"
        size="small"
        class="mr-2 font-weight-medium"
      >
        <v-icon start size="medium" class="pl-2 mr-2">{{ connectionStatusIcon }}</v-icon>
        <span class="font-weight-bold">{{ connectionStatusText }}</span>
      </v-chip>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimeslotStore } from '../stores/timeslot';

const emit = defineEmits<{
  (e: 'reconnect'): void;
}>();

const store = useTimeslotStore();

const connectionStatusColor = computed(() => {
  if (store.sseReconnecting) return 'warning';
  if (store.sseConnected) return 'success';
  return 'error';
});
const connectionStatusVariant = computed(() => (store.sseConnected ? 'flat' : 'tonal'));
const connectionStatusIcon = computed(() => {
  if (store.sseReconnecting) return 'mdi-loading mdi-spin';
  if (store.sseConnected) return 'mdi-wifi';
  return 'mdi-wifi-off';
});
const connectionStatusText = computed(() => {
  if (store.sseReconnecting) return 'Reconnecting...';
  if (store.sseConnected) return 'Live Updates';
  return 'Disconnected';
});
</script>
