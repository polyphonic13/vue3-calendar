import { ref } from 'vue';
import { defineStore } from 'pinia';

import { useLocalStorage } from '@/composables/use-local-storage';

import type {
    IEvent,
    IEventState,
} from '@/interfaces/';

const LOCAL_STORAGE_KEY = 'calendarAppEventData';

const { load, save } = useLocalStorage();

export const useEventStore = defineStore('eventStore', () => {
    const createState = (): IEventState => {
        const savedState = load<IEventState>(LOCAL_STORAGE_KEY);

        if (savedState) {
            console.log(`EventStore/createState, savedState events = `, savedState.events);
            return savedState;
        }

        return {
            events: [],
            isViewingEvent: false,
            focusedEvent: null,
        };
    };

    const state = ref<IEventState>(createState());

    const eventFactory = (base: Partial<IEvent>) => {
        const event: IEvent = {
            id: Date.now(),
            title: '',
            description: '',
            location: '',
            times: {
                start: 0,
                end: 0,
            },
            year: 1900,
            month: 0,
            dates: {
                start: 1,
                end: 1,
            },
            ...base,
        };
        return event;
    };

    const getEvents = (): IEvent[] => {
        return state.value.events;
    };

    const getEventsForRange = (year: number, month: number, startDate?: number, endDate?: number): IEvent[] => {
        const monthEvents = state.value.events.filter((event: IEvent) => event.year === year && event.month === month);

        if (!startDate || !endDate) {
            return monthEvents;
        }

        return monthEvents.filter((event: IEvent) => event.dates.start >= startDate && event.dates.end <= endDate).sort((a, b) => { return a.times.start - b.times.start });
    };

    const createEvent = (payload: Partial<IEvent>) => {
        state.value.focusedEvent = eventFactory(payload);
    }

    const addEvent = () => {
        state.value.isViewingEvent = false;

        if (!state.value.focusedEvent) {
            console.warn(`ERROR: can not add new event`);
            return;
        }
        const event: IEvent = state.value.focusedEvent as IEvent;
        state.value.events.push(event);
        save<IEventState>(LOCAL_STORAGE_KEY, state.value);
    };

    const viewEvent = (payload: Partial<IEvent>) => {
        if (!payload.id) {
            console.warn(`ERROR: can not edit event without value id\n${JSON.stringify(payload)}`);
            return;
        }
        state.value.focusedEvent = payload;
        state.value.isViewingEvent = true;
    };

    const cancelEditEvent = () => {
        state.value.isViewingEvent = false;

        if (!state.value.focusedEvent) {
            return;
        }
        state.value.focusedEvent = null;
    };

    const updateEvent = () => {
        state.value.isViewingEvent = false;

        if (!state.value.focusedEvent) {
            console.warn(`ERROR: can not update event`);
            return;
        }
        state.value.events = state.value.events.map((event: IEvent) => {
            return (event.id === state.value.focusedEvent!.id) ? { ...event, ...state.value.focusedEvent! } : event;
        });
        save<IEventState>(LOCAL_STORAGE_KEY, state.value);
    };

    const deleteEvent = () => {
        state.value.isViewingEvent = false;

        if (!state.value.focusedEvent || !state.value.focusedEvent.id) {
            console.warn(`ERROR: can not delete event`);
            return;
        }
        state.value.events = state.value.events.filter((event: IEvent) => event.id !== state.value.focusedEvent!.id);
        save<IEventState>(LOCAL_STORAGE_KEY, state.value);
    };

    const getisViewingEvent = () => {
        return state.value.isViewingEvent;
    };

    const setisViewingEvent = (value: boolean) => {
        state.value.isViewingEvent = value;
    };

    const getFocusedEvent = () => {
        return state.value.focusedEvent;
    }

    return {
        getEvents,
        getEventsForRange,
        createEvent,
        addEvent,
        viewEvent,
        cancelEditEvent,
        updateEvent,
        deleteEvent,
        getisViewingEvent,
        setisViewingEvent,
        getFocusedEvent,
    };
});
