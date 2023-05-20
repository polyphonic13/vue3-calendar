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
        };
    };

    const state = ref<IEventState>(createState());

    const createEvent = (base: Partial<IEvent>) => {
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

    const addEvent = (payload: Partial<IEvent>) => {
        const event: IEvent = createEvent(payload);
        state.value.events.push(event);
        console.log(`EventStore/addEvent, event = ${JSON.stringify(event)}`);
        save<IEventState>(LOCAL_STORAGE_KEY, state.value);
    };

    const updateEvent = (payload: IEvent) => {
        state.value.events = state.value.events.map((event: IEvent) => {
            return (event.id === payload.id) ? payload : event;
        });
        save<IEventState>(LOCAL_STORAGE_KEY, state.value);
    };

    const deleteEvent = (id: number) => {
        state.value.events = state.value.events.filter((event: IEvent) => event.id !== id);
        save<IEventState>(LOCAL_STORAGE_KEY, state.value);
    };

    return {
        getEvents,
        addEvent,
        updateEvent,
        deleteEvent,
    };
});
