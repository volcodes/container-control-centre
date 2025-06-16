<template>
  <v-card class="time-slot-card" :class="[`category-${props.slot.category}`]" rounded="none" elevation="4">
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100 mt-2">
        <div class="time-display">
          <v-icon class="mr-2" size="small">mdi-clock-outline</v-icon>
          <span class="text-h6">{{ formattedDate }}</span>
        </div>
        <v-chip size="small" variant="tonal" :color="filteredCategoryColor" class="font-weight-bold text-capitalize">
          {{ props.slot.category }}
        </v-chip>
      </div>
    </v-card-title>

    <v-card-text class="slot-content">
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-body-1 font-weight-medium">Capacity</span>
        <span class="text-h6 font-weight-bold">
          {{ formattedCapacity }}
        </span>
      </div>

      <v-progress-linear
        :model-value="capacityPercentage"
        :color="filteredCategoryColor"
        height="8"
        rounded
        class="mb-2"
      />

      <div class="d-flex justify-space-between align-center">
        <span class="text-body-2 font-weight-medium"> {{ capacityPercentage }}% full </span>
        <span class="text-body-2 text-medium-emphasis">
          {{ capacityStatusText }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TimeSlot } from '../types';

interface Props {
  slot: TimeSlot;
}
const props = defineProps<Props>();

const capacity = computed(() => props.slot.capacity);
const formattedCapacity = computed(() => `${capacity.value.current}/${capacity.value.max}`);
const formattedDate = computed(() => {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return `${formatTime(props.slot.startTime)} - ${formatTime(props.slot.endTime)}`;
});
const capacityPercentage = computed(() => {
  const { current, max } = capacity.value;
  return max > 0 ? Math.round((current / max) * 100) : 0;
});
const capacityStatusText = computed(() => {
  const { current, max } = capacity.value;
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;

  if (current > max) {
    return `Over capacity by ${current - max} trucks`;
  } else if (percentage >= 95) {
    return 'Critical - Nearly full';
  } else if (percentage >= 85) {
    return 'High utilization';
  } else if (percentage >= 70) {
    return 'Moderate usage';
  } else if (percentage >= 40) {
    return 'Available capacity';
  } else if (percentage >= 20) {
    return 'Good availability';
  } else {
    return 'Excellent availability';
  }
});
const filteredCategoryColor = computed(() => {
  return props.slot.category.toLowerCase() === 'yellow' ? 'orange' : props.slot.category.toLowerCase();
});
</script>

<style scoped>
.time-slot-card.category-green {
  border-left-color: #4caf50;
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
}

.time-slot-card.category-yellow {
  border-left-color: #ff9800;
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
}

.time-slot-card.category-red {
  border-left-color: #f44336;
  background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);
}
</style>
