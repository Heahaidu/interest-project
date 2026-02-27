import { eventApi } from '@/lib/api/event';
import { Event } from '@/lib/types';
import { create } from 'zustand';

interface EventState {
  event: Event | null;
  setSelectedEvent: (e: Event) => void;
  getEvent: (uuid: string) => Promise<void>
}

export const useEventStore = create<EventState>((set, get )=> ({
  event: null,
  setSelectedEvent: e => set({ event: e }),

  getEvent: async (uuid) => {
    const {event} = get();

    if (event && event.uuid === uuid && event.description) {
      set({event});
      return;

    }
    const event_ = await eventApi.get(uuid);

    set({ event: event_})
  }

}));
