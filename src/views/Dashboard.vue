<template>
  <div>
    <Header @reconnect="store.startRealtime" />

    <v-main>
      <v-container fluid class="pa-5">
        <LoadingIndicator
          v-if="store.isLoading && Object.keys(store.groupedSlots).length === 0"
          title="Loading time slots..."
          subtitle="Fetching latest reservation data"
        />

        <!-- Error State -->
        <v-alert
          v-else-if="store.error"
          type="error"
          variant="tonal"
          class="mb-6"
          closable
          @click:close="store.setError(null)"
        >
          <v-alert-title>Error Loading Data</v-alert-title>
          <div>{{ store.error }}</div>
          <template #append>
            <v-btn variant="text" size="small" @click="store.fetchTimeSlots"> Retry </v-btn>
          </template>
        </v-alert>

        <!-- SingleDayRow -->
        <SingleDayRow v-for="(slots, date) in store.groupedSlots" :key="date" :date="date.toString()" :slots="slots" />

        <!-- Empty State -->
        <v-card
          v-if="Object.keys(store.groupedSlots).length === 0 && !store.isLoading && !store.error"
          class="text-center pa-12 ma-6"
          elevation="2"
          rounded="lg"
          variant="tonal"
        >
          <v-icon size="x-large" color="medium-emphasis" class="mb-6"> mdi-calendar-clock-outline </v-icon>
          <h2 class="text-h4 text-medium-emphasis mb-4">No Time Slots Available</h2>
          <p class="text-body-1 text-medium-emphasis mb-6">There are currently no reservation time slots scheduled.</p>
          <v-btn color="primary" size="large" @click="store.fetchTimeSlots">
            <v-icon start>mdi-refresh</v-icon>
            Refresh Data
          </v-btn>
        </v-card>
      </v-container>
    </v-main>

    <Notification v-if="store.snackbarMessage" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useTimeslotStore } from '../stores/timeslot';
import Header from '../components/Header.vue';
import SingleDayRow from '../components/SingleDayRow.vue';
import LoadingIndicator from '../components/LoadingIndicator.vue';
import Notification from '../components/Notification.vue';

const store = useTimeslotStore();

onMounted(async () => {
  await store.fetchTimeSlots();
  store.startRealtime();
});

onBeforeUnmount(() => {
  store.stopRealtime();
});
</script>
