import { useState } from 'react';

interface CalendarSubscriptionState {
  isSubscribing: boolean;
  isSuccess: boolean;
  error: string | null;
  eventsCreated: number | null;
}

interface CalendarSubscriptionOptions {
  startDate: Date;
  endDate: Date;
}

export function useCalendarSubscription() {
  const [state, setState] = useState<CalendarSubscriptionState>({
    isSubscribing: false,
    isSuccess: false,
    error: null,
    eventsCreated: null,
  });

  const subscribeToPrayerTimes = async (options: CalendarSubscriptionOptions) => {
    setState({
      isSubscribing: true,
      isSuccess: false,
      error: null,
      eventsCreated: null,
    });

    try {
      const response = await fetch('/api/calendar/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: options.startDate.toISOString(),
          endDate: options.endDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe to prayer times');
      }

      setState({
        isSubscribing: false,
        isSuccess: true,
        error: null,
        eventsCreated: data.eventsCreated,
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({
        isSubscribing: false,
        isSuccess: false,
        error: errorMessage,
        eventsCreated: null,
      });
      throw error;
    }
  };

  const testCalendarAccess = async () => {
    try {
      const response = await fetch('/api/calendar/subscribe', {
        method: 'GET',
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Calendar access test failed:', error);
      return false;
    }
  };

  const resetState = () => {
    setState({
      isSubscribing: false,
      isSuccess: false,
      error: null,
      eventsCreated: null,
    });
  };

  return {
    ...state,
    subscribeToPrayerTimes,
    testCalendarAccess,
    resetState,
  };
}
