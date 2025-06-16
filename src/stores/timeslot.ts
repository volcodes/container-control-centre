import { defineStore } from 'pinia';
import { ref, computed, onScopeDispose } from 'vue';
import type { TimeSlot, SSEUpdateEvent, GroupedSlots, UIState, SnackbarMessage } from '../types';
import { timeSlotService } from '../services/timeslot';
import { useSSE } from '../composables/useSSE';

/**
 * Pinia store for managing time slots state and real-time updates
 * Handles data fetching, SSE connection management, and UI state
 */
export const useTimeslotStore = defineStore('timeSlots', () => {
  // State
  const slots = ref<TimeSlot[]>([]);
  const uiState = ref<UIState>({
    isLoading: false,
    error: null,
    sseConnected: false,
    sseReconnecting: false,
  });
  const snackbarMessage = ref<SnackbarMessage | null>(null);

  // SSE connection instance
  const sse = useSSE();

  // Computed
  const groupedSlots = computed<GroupedSlots>(() => {
    const grouped: GroupedSlots = {};

    slots.value.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });

    // Sort dates
    const sortedKeys = Object.keys(grouped).sort();
    const sortedGrouped: GroupedSlots = {};
    sortedKeys.forEach((key) => {
      // Sort slots within each date by start time
      sortedGrouped[key] = grouped[key].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    });

    return sortedGrouped;
  });

  const isLoading = computed(() => uiState.value.isLoading);
  const error = computed(() => uiState.value.error);
  const sseConnected = computed(() => uiState.value.sseConnected);
  const sseReconnecting = computed(() => uiState.value.sseReconnecting);

  // Internal state setters
  const setLoading = (loading: boolean) => {
    uiState.value.isLoading = loading;
  };

  const setError = (error: string | null) => {
    uiState.value.error = error;
  };

  const setSSEConnected = (connected: boolean) => {
    uiState.value.sseConnected = connected;
  };

  const setSSEReconnecting = (reconnecting: boolean) => {
    uiState.value.sseReconnecting = reconnecting;
  };

  // Public actions
  const showSnackbar = (message: SnackbarMessage) => {
    snackbarMessage.value = message;
  };

  const hideSnackbar = () => {
    snackbarMessage.value = null;
  };

  const fetchTimeSlots = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await timeSlotService.fetchTimeSlots();

      if (response.success && response.data) {
        slots.value = response.data;
        showSnackbar({
          message: `Loaded ${response.data.length} time slots`,
          type: 'success',
          timeout: 3000,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch time slots');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      showSnackbar({
        message: `Error loading time slots: ${errorMessage}`,
        type: 'error',
        timeout: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Internal SSE event handlers
  const updateSlotFromSSE = (update: SSEUpdateEvent) => {
    const slotIndex = slots.value.findIndex((slot) => slot.id === update.id);

    if (slotIndex !== -1) {
      const updatedSlot = {
        ...slots.value[slotIndex],
        capacity: {
          ...slots.value[slotIndex].capacity,
          current: update.currentCapacity,
        },
        category: update.category,
        // Add SSE update tracking for debugging
        lastSSEUpdate: Date.now(),
        hasSSEUpdate: true,
      };

      slots.value[slotIndex] = updatedSlot;

      console.log(
        `🔄 SSE Update: Slot ${update.id} → ${update.currentCapacity}/${updatedSlot.capacity.max} (${update.category}) at ${new Date().toLocaleTimeString()}`,
      );
    } else {
      console.warn(`⚠️ SSE Update Failed: Slot with ID ${update.id} not found`);
    }
  };

  const handleSSEConnect = () => {
    setSSEConnected(true);
    setSSEReconnecting(false);
    showSnackbar({
      message: 'Real-time updates connected',
      type: 'success',
      timeout: 3000,
    });
  };

  const handleSSEDisconnect = () => {
    setSSEConnected(false);
    showSnackbar({
      message: 'Real-time updates disconnected',
      type: 'warning',
      timeout: 3000,
    });
  };

  const handleSSEReconnecting = () => {
    setSSEReconnecting(true);
    showSnackbar({
      message: 'Reconnecting to real-time updates...',
      type: 'info',
      timeout: 3000,
    });
  };

  const handleSSEError = (error: string) => {
    setSSEConnected(false);
    setSSEReconnecting(false);
    showSnackbar({
      message: `Connection error: ${error}`,
      type: 'error',
      timeout: 5000,
    });
  };

  // Configure SSE event handlers
  sse.setEventHandlers({
    onConnect: handleSSEConnect,
    onDisconnect: handleSSEDisconnect,
    onReconnecting: handleSSEReconnecting,
    onError: handleSSEError,
    onUpdate: updateSlotFromSSE,
  });

  /**
   * Start real-time updates via SSE
   */
  const startRealtime = () => {
    sse.connect();
  };

  /**
   * Stop real-time updates and disconnect SSE
   */
  const stopRealtime = () => {
    sse.disconnect();
  };

  // Cleanup SSE connection when store is disposed
  onScopeDispose(() => {
    sse.cleanup();
  });

  return {
    // State
    slots: computed(() => slots.value),
    groupedSlots,
    isLoading,
    error,
    sseConnected,
    sseReconnecting,
    snackbarMessage: computed(() => snackbarMessage.value),

    // Actions
    fetchTimeSlots,
    setError,
    showSnackbar,
    hideSnackbar,

    // Real-time connection management
    startRealtime,
    stopRealtime,
  };
});
