// Raw API response types (handles inconsistent keys from API)
export interface RawTimeSlotResponse {
  id: number;
  // Start time can be either key
  start_time?: string;
  startTime?: string;
  // End time can be either key
  end_time?: string;
  endTime?: string;
  category: SlotCategory;
  capacity: RawCapacity;
}

export interface RawCapacity {
  // Current capacity can be either key
  current_capacity?: number;
  current?: number;
  // Max capacity can be either key
  max_capacity?: number;
  maximum?: number;
}

// Normalized internal types (consistent structure)
export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  category: SlotCategory;
  capacity: Capacity;
  date: string; // ISO date string for grouping
  // SSE update tracking (optional, added when SSE updates occur)
  lastSSEUpdate?: number;
  hasSSEUpdate?: boolean;
}

export interface Capacity {
  current: number;
  max: number;
}

export type SlotCategory = 'green' | 'yellow' | 'red';

// SSE event types
export interface SSEUpdateEvent {
  id: number;
  currentCapacity: number;
  category: SlotCategory;
}

// Grouped slots by date
export interface GroupedSlots {
  [date: string]: TimeSlot[];
}

// UI state types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  sseConnected: boolean;
  sseReconnecting: boolean;
}

// Snackbar types
export interface SnackbarMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: number;
}

// Service response types
export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Composable return types
export interface UseSSEReturn {
  connect: () => void;
  disconnect: () => void;
  cleanup: () => void;
  setEventHandlers: (handlers: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onReconnecting?: () => void;
    onError?: (error: string) => void;
    onUpdate?: (update: SSEUpdateEvent) => void;
  }) => void;
}
