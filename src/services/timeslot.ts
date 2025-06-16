import { format } from 'date-fns';
import type { RawTimeSlotResponse, TimeSlot, ServiceResponse } from '../types';

/**
 * Service for handling time slot API operations
 * Responsible for fetching data and normalizing inconsistent API keys
 */
class TimeSlotService {
  private readonly baseUrl = 'https://timeslot-stream-ha2tva3niq-ey.a.run.app';

  /**
   * Normalize raw API response to consistent internal format
   * This handles the inconsistent keys from the API
   */
  private normalizeTimeSlot(raw: RawTimeSlotResponse): TimeSlot {
    // Handle inconsistent start time keys
    const startTime = raw.start_time || raw.startTime;
    if (!startTime) {
      throw new Error('Start time not found in API response');
    }

    // Handle inconsistent end time keys
    const endTime = raw.end_time || raw.endTime;
    if (!endTime) {
      throw new Error('End time not found in API response');
    }

    // Handle inconsistent capacity keys
    const currentCapacity = raw.capacity.current_capacity ?? raw.capacity.current;
    const maxCapacity = raw.capacity.max_capacity ?? raw.capacity.maximum;

    if (currentCapacity === undefined || maxCapacity === undefined) {
      throw new Error('Capacity data not found in API response');
    }

    // Extract date for grouping (format: YYYY-MM-DD)
    const date = format(new Date(startTime), 'yyyy-MM-dd');

    return {
      id: raw.id,
      startTime,
      endTime,
      category: raw.category,
      capacity: {
        current: currentCapacity,
        max: maxCapacity,
      },
      date,
    };
  }

  /**
   * Fetch all time slots from the API
   * Returns normalized data or error information
   */
  async fetchTimeSlots(): Promise<ServiceResponse<TimeSlot[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/timeSlots`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData: RawTimeSlotResponse[] = await response.json();

      // Normalize all slots to consistent format
      const normalizedSlots = rawData.map((slot) => this.normalizeTimeSlot(slot));

      // Sort by start time for consistent display
      normalizedSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      return {
        data: normalizedSlots,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Get the SSE endpoint URL
   */
  getSSEUrl(): string {
    return `${this.baseUrl}/sse`;
  }
}

// Export singleton instance
export const timeSlotService = new TimeSlotService();
