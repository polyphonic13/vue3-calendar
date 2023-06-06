import { ref } from 'vue';
import { defineStore } from 'pinia';

import { useLocalStorage } from '@/composables/use-local-storage';
import { useDateUtils } from '@/composables/use-date-utils';

import type {
    IEvent,
    IEventState,
    ISerializedEvent,
    ISerializedEventState,
} from '@/interfaces/';

const LOCAL_STORAGE_KEY = 'calendarAppEventData';

const { load, save } = useLocalStorage();
const { getDifferenceInDays, getAreDatesWithinRange } = useDateUtils();

export const useEventStore = defineStore('eventStore', () => {
    const deserializeEvents = (serialized: ISerializedEvent[]): IEvent[] => {
        return serialized.map((event: ISerializedEvent) => {
            return {
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            };
        });
    };

    const serializeEvents = (): ISerializedEvent[] => {
        return state.value.events.map((event: IEvent) => {
            return {
                ...event,
                start: event.start.toJSON(),
                end: event.end.toJSON(),
            };
        });
    };

    const createState = (): IEventState => {
        const savedState = load<ISerializedEventState>(LOCAL_STORAGE_KEY);

        if (savedState) {
            return {
                events: deserializeEvents(savedState.events),
                isViewingEvent: false,
                focusedEvent: null,
            };
        }

        return {
            events: [],
            isViewingEvent: false,
            focusedEvent: null,
        };
    };

    const state = ref<IEventState>(createState());
    console.log(`EventsStore/init, state = `, state.value);

    const eventFactory = (seed: Partial<IEvent>) => {
        const today = new Date();
        const event: IEvent = {
            id: today.getTime(),
            title: '',
            description: '',
            location: '',
            start: today,
            end: new Date(),
            dayCount: 0,
            ...seed,
        };

        return event;
    };

    const getEvents = (): IEvent[] => {
        return state.value.events;
    };

    const getEventsForRange = (startDate: Date, endDate: Date, isSorted: boolean = true): IEvent[] => {
        const events = state.value.events.filter((event: IEvent) => {
            if (getAreDatesWithinRange(event.start, event.end, startDate, endDate, true)) {
                return event;
            }
        });

        if (!isSorted) {
            return events;
        }

        return [...events].sort((a, b) => {
            return a.start.getTime() - b.start.getTime();
        });
    };

    const createEvent = (payload: Partial<IEvent>) => {
        state.value.focusedEvent = eventFactory(payload);
    };

    const addEvent = () => {
        state.value.isViewingEvent = false;
        if (!state.value.focusedEvent) {
            console.warn(`ERROR: can not add new event`);
            return;
        }
        const event: IEvent = eventFactory(state.value.focusedEvent);
        state.value.events.push(event);
        event.dayCount = getDaysInEventCount(event);

        saveEvents();
    };

    const viewEvent = (payload: Partial<IEvent>) => {
        if (!payload.id) {
            console.warn(`ERROR: can not edit event without value id\n${JSON.stringify(payload)}`);
            return;
        }
        const copy = JSON.parse(JSON.stringify(payload));
        copy.start = new Date(copy.start);
        copy.end = new Date(copy.end);
        state.value.focusedEvent = copy;
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

        state.value.focusedEvent.dayCount = getDaysInEventCount(state.value.focusedEvent as IEvent);

        state.value.events = state.value.events.map((event: IEvent) => {
            return (event.id === state.value.focusedEvent!.id) ? { ...event, ...state.value.focusedEvent! } : event;
        });
        saveEvents();
    };

    const deleteEvent = () => {
        state.value.isViewingEvent = false;

        if (!state.value.focusedEvent || !state.value.focusedEvent.id) {
            console.warn(`ERROR: can not delete event`);
            return;
        }
        state.value.events = state.value.events.filter((event: IEvent) => event.id !== state.value.focusedEvent!.id);
        saveEvents();
    };

    const getisViewingEvent = () => {
        return state.value.isViewingEvent;
    };

    const setIsViewingEvent = (value: boolean) => {
        state.value.isViewingEvent = value;
    };

    const getFocusedEvent = (): Partial<IEvent> | null => {
        return state.value.focusedEvent;
    }

    const getIsFullDayEvent = (event: Partial<IEvent>) => {
        if (!event) {
            return true;
        }

        if (!event.start || !event.end) {
            return true;
        }

        const startHour = event.start.getHours();
        const endHour = event.end.getHours();

        return startHour === 0 && endHour === 0;
    };

    const getIsSameDayEvent = () => {
        if (!state.value.focusedEvent) {
            return true;
        }

        const focusedEvent: Partial<IEvent> = state.value.focusedEvent;

        if (!focusedEvent.start || !focusedEvent.end) {
            return true;
        }

        const { start, end } = focusedEvent;
        console.log(`start = `, start, `\nend = `, end);
        return (start.getFullYear() === end.getFullYear()) && (start.getMonth() === end.getMonth()) && (start.getDate() === end.getDate());
    };

    const getDaysInEventCount = (event: IEvent) => {
        return getDifferenceInDays(event.start, event.end) + 1;
    };

    const getDaysInEventInDateRangeCount = (event: IEvent, rangeStart: Date, rangeEnd: Date) => {
        return getDifferenceInDays(event.start, event.end, rangeStart, rangeEnd) + 1;
    };

    const saveEvents = () => {
        const events = serializeEvents();
        const serialized = {
            events,
        };
        save<ISerializedEventState>(LOCAL_STORAGE_KEY, serialized);
    };

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
        setIsViewingEvent,
        getFocusedEvent,
        getIsFullDayEvent,
        getIsSameDayEvent,
        getDaysInEventCount,
        getDaysInEventInDateRangeCount,
    };
});
