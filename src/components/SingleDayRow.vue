<template>
  <div class="d-flex flex-column">
    <div class="d-flex align-center w-100 pb-4">
      <v-progress-circular
        :model-value="stats.totalCapacityPercentage"
        :size="56"
        :width="5"
        :color="getOverallDayCapacityColor"
        class="mr-2 mr-md-4 font-weight-bold font-manrope text-h6"
      >
        %{{ stats.totalCapacityPercentage }}
      </v-progress-circular>
      <h3 :class="`text-h6 text-md-h3 font-weight-bold text-${getOverallDayCapacityColor}`">
        {{ formattedDate }}, {{ dayOfWeek }}
      </h3>
    </div>

    <div class="slots-container mb-12">
      <v-row v-if="slots.length > 0">
        <v-col v-for="slot in slots" :key="slot.id" cols="12" sm="6" md="4" lg="3" class="slot-column">
          <Card :slot="slot" />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <div v-else class="empty-state text-center py-8">
        <v-icon size="64" color="medium-emphasis" class="mb-4"> mdi-calendar-blank-outline </v-icon>
        <h4 class="text-h6 text-medium-emphasis mb-2">No time slots available</h4>
        <p class="text-body-2 text-medium-emphasis">There are no reservation slots scheduled for this date.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format, parseISO } from 'date-fns';
import type { TimeSlot } from '../types';
import Card from './Card.vue';

interface Props {
  date: string;
  slots: TimeSlot[];
}
const props = defineProps<Props>();

const formattedDate = computed(() => format(parseISO(props.date), 'MMMM d, yyyy'));
const dayOfWeek = computed(() => format(parseISO(props.date), 'EEEE'));

/*
 *My additional UI suggestions for allowing users/ TODO: !!
 */
const stats = computed(() => {
  const totalCapacity = props.slots.reduce((sum, slot) => sum + slot.capacity.max, 0);
  const totalCurrent = props.slots.reduce((sum, slot) => sum + slot.capacity.current, 0);
  const totalCapacityPercentage = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;

  return { totalCapacity, totalCapacityPercentage };
});
const getOverallDayCapacityColor = computed(() => {
  if (stats.value.totalCapacityPercentage >= 75) {
    return 'red';
  } else if (stats.value.totalCapacityPercentage >= 40) {
    return 'orange';
  } else {
    return 'green';
  }
});
</script>
