import type { SSEUpdateEvent, UseSSEReturn } from '../types';
import { timeSlotService } from '../services/timeslot';

/**
 * Store-agnostic SSE connection manager
 * Provides raw SSE connection functionality with reconnection logic
 * State management is handled externally (e.g., in Pinia stores)
 */
export function useSSE(): UseSSEReturn {
  let eventSource: EventSource | null = null;
  let reconnectTimer: number | null = null;
  let reconnectAttempts = 0;

  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second
  const maxReconnectDelay = 30000; // 30 seconds

  // Event handlers - to be set by consuming code
  let onConnect: () => void = () => {};
  let onDisconnect: () => void = () => {};
  let onReconnecting: () => void = () => {};
  let onError: (error: string) => void = () => {};
  let onUpdate: (update: SSEUpdateEvent) => void = () => {};

  /**
   * Calculate exponential backoff delay for reconnection
   */
  const getReconnectDelay = (): number => {
    const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), maxReconnectDelay);
    return delay + Math.random() * 1000; // Add jitter
  };

  /**
   * Clean up existing connection
   */
  const cleanup = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  /**
   * Connect to SSE endpoint
   */
  const connect = () => {
    cleanup();

    try {
      const sseUrl = timeSlotService.getSSEUrl();
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        reconnectAttempts = 0;
        onConnect();
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEUpdateEvent = JSON.parse(event.data);
          onUpdate(data);
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
          onError('Invalid data received from server');
        }
      };

      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);

        if (eventSource?.readyState === EventSource.CLOSED) {
          // Connection closed, attempt to reconnect
          onDisconnect();
          attemptReconnect();
        } else {
          // Connection error but still open
          onError('Connection error occurred');
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create SSE connection';
      onError(errorMessage);
    }
  };

  /**
   * Attempt to reconnect with exponential backoff
   */
  const attemptReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      onError(`Max reconnection attempts (${maxReconnectAttempts}) reached`);
      return;
    }

    reconnectAttempts++;
    onReconnecting();

    const delay = getReconnectDelay();
    console.log(
      `Attempting to reconnect in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempts}/${maxReconnectAttempts})`,
    );

    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  };

  /**
   * Manually disconnect from SSE
   */
  const disconnect = () => {
    cleanup();
    onDisconnect();
  };

  /**
   * Set event handlers
   */
  const setEventHandlers = (handlers: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onReconnecting?: () => void;
    onError?: (error: string) => void;
    onUpdate?: (update: SSEUpdateEvent) => void;
  }) => {
    if (handlers.onConnect) onConnect = handlers.onConnect;
    if (handlers.onDisconnect) onDisconnect = handlers.onDisconnect;
    if (handlers.onReconnecting) onReconnecting = handlers.onReconnecting;
    if (handlers.onError) onError = handlers.onError;
    if (handlers.onUpdate) onUpdate = handlers.onUpdate;
  };

  return {
    connect,
    disconnect,
    cleanup,
    setEventHandlers,
  };
}
