import { ref } from 'vue';
import { defineStore } from 'pinia';

import { useLocalStorage } from '@/composables/use-local-storage';
import { useDateUtils } from '@/composables/use-date-utils';

import type {
    IEvent,
    IEventState,
    INumberRange,
    IYearMonthDay,
    IYearMonthDayTime,
} from '@/interfaces/';

const LOCAL_STORAGE_KEY = 'calendarAppEventData';

const { load, save } = useLocalStorage();
const { getDifferenceInDays, getAreDatesWithinRange } = useDateUtils();

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

    const eventFactory = (seed: Partial<IEvent>) => {
        const event: IEvent = {
            id: Date.now(),
            title: '',
            description: '',
            location: '',
            start: {
                year: 0,
                month: 0,
                day: 0,
                time: 0,
            },
            end: {
                year: 1900,
                month: 0,
                day: 0,
                time: 0,
            },
            ...seed,
        };
        return event;
    };

    const getEvents = (): IEvent[] => {
        return state.value.events;
    };

    const getEventsForRange = (startDate: IYearMonthDay, endDate: IYearMonthDay): IEvent[] => {
        const events = state.value.events.filter((event: IEvent) => {
            if (getAreDatesWithinRange(event.start, event.end, startDate, endDate)) {
                return event;
            }
        });

        return events;
    };

    const createEvent = (payload: Partial<IEvent>) => {
        state.value.focusedEvent = eventFactory(payload);
    };

    const createEventStartAndEnd = (times: INumberRange, day: number, month: number, year: number, dates?: INumberRange, months?: INumberRange, years?: INumberRange) => {
        if (!state.value.focusedEvent) {
            console.warn(`ERROR: can not init start/end on undefined focusedEvent`);
            return;
        }

        const start: IYearMonthDayTime = {
            year: (years) ? years.start : year,
            month: (months) ? months.start : month,
            day: (dates) ? dates.start : day,
            time: times.start,
        };

        const end: IYearMonthDayTime = {
            year: (years) ? years.end : year,
            month: (months) ? months.end : month,
            day: (dates) ? dates.end : day,
            time: times.start,
        };

        const event: Partial<IEvent> = {
            start,
            end,
        };

        return event;
    };

    const addEvent = () => {
        state.value.isViewingEvent = false;
        console.log(`event store \`addEvent\`, focusedEvent = ${JSON.stringify(state.value.focusedEvent)}`);
        if (!state.value.focusedEvent) {
            console.warn(`ERROR: can not add new event`);
            return;
        }
        const event: IEvent = eventFactory(state.value.focusedEvent);
        console.log(`\tnew event = ${JSON.stringify}`);
        state.value.events.push(event);
        console.log(`\tadded new devent to the state's events array`);
        save<IEventState>(LOCAL_STORAGE_KEY, state.value);
        console.log(`\tsaved even in local storage`);
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

    const setIsViewingEvent = (value: boolean) => {
        state.value.isViewingEvent = value;
    };

    const getFocusedEvent = (): Partial<IEvent> | null => {
        return state.value.focusedEvent;
    }

    const getIsFullDayEvent = () => {
        if (!state.value.focusedEvent) {
            return true;
        }

        const focusedEvent: Partial<IEvent> = state.value.focusedEvent;

        if (!focusedEvent.start || !focusedEvent.end) {
            return true;
        }

        return focusedEvent.start.time === 0 && focusedEvent.end.time === 0;
    };

    const getIsSameDayEvent = () => {
        if (!state.value.focusedEvent) {
            return true;
        }

        const focusedEvent: Partial<IEvent> = state.value.focusedEvent;

        if (!focusedEvent.start || !focusedEvent.end) {
            return true;
        }

        return (focusedEvent.start.year === focusedEvent.end.year) &&
            (focusedEvent.start.month === focusedEvent.end.month) &&
            (focusedEvent.start.day === focusedEvent.end.day);
    };

    const getDaysInEventCount = (event: IEvent) => {
        const start = event.start;
        const end = event.end;

        return getDifferenceInDays(start, end);
    };

    return {
        getEvents,
        getEventsForRange,
        createEvent,
        createEventStartAndEnd,
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
    };
});
