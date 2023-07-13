import { ref } from 'vue';
import { defineStore } from 'pinia';

import { useLocalStorage } from '@/composables/use-local-storage';
import { useDateUtils } from '@/composables/use-date-utils';

import calendars from '@/data/event-calendars';

import type {
    IEvent,
    IEventCalendar,
    IEventState,
    ISerializedEvent,
    ISerializedEventState,
} from '@/interfaces/';

const LOCAL_STORAGE_KEY = 'calendarAppEventData';

const { load, save } = useLocalStorage();
const {
    getDifferenceInDays,
    getAreDatesWithinRange,
    dateAddition,
    getIsLeapYear,
    getLastDayOfMonth,
} = useDateUtils();

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

    const initializeCalendars = (): IEventCalendar[] => {
        return calendars.map(calendar => {
            return {
                ...calendar,
                isActive: true,
            };
        });
    };

    const getDaysInEventCount = (event: IEvent) => {
        const start = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
        const end = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
        let count = getDifferenceInDays(start, dateAddition(end, 1));

        if (count < 1) {
            count = 1;
        }
        return count;
    };

    const createState = (): IEventState => {
        const savedState = load<ISerializedEventState>(LOCAL_STORAGE_KEY);

        if (savedState) {
            const calendars = (savedState.calendars) ? savedState.calendars : initializeCalendars();

            return {
                events: deserializeEvents(savedState.events),
                isViewingEvent: false,
                calendars,
                focusedEvent: null,
                focusedDay: null,
            };
        }

        return {
            events: [],
            isViewingEvent: false,
            calendars: initializeCalendars(),
            focusedEvent: null,
            focusedDay: null,
        };
    };

    const state = ref<IEventState>(createState());
    console.log(`EventsStore/init, state events = `, state.value.events, `\ncalendars = ${JSON.stringify(calendars)}`);

    const getCalendarNames = () => {
        return state.value.calendars.map(calendar => calendar.name);
    };

    const getEventCalendars = () => {
        return state.value.calendars;
    };

    const getActiveCalendarNames = (): string[] => {
        return state.value.calendars.filter(calendar => calendar.isActive).map(calendar => calendar.name);
    };

    const setCalendarActive = (name: string, isActive: boolean) => {
        state.value.calendars = state.value.calendars.map(calendar => {
            if (calendar.name === name) {
                calendar.isActive = isActive;
            }
            return calendar;
        });
        saveState();
    };

    const getIsAllDay = (event: Partial<IEvent>) => {
        if (event.isAllDay) {
            return event.isAllDay;
        }

        if (!event.start || !event.end) {
            return true;
        }

        return event.start.getHours() === 0 && event.start.getMinutes() === 0 && event.end.getHours() === 0 && event.end.getMinutes() === 0;
    };

    const eventFactory = (value: Partial<IEvent>) => {
        const today = new Date();

        const isAllDay = getIsAllDay(value);

        const event: IEvent = {
            id: today.getTime(),
            title: '',
            description: '',
            location: '',
            start: today,
            end: today,
            calendarName: '',
            dayCount: 0,
            isAllDay,
            isRepeating: false,
            ...value,
        };

        return event;
    };

    const filterEventsByActiveCalendars = (events: IEvent[]) => {
        const activeCalendars = getActiveCalendarNames();

        return events.filter(event => activeCalendars.includes(event.calendarName));
    };

    const getEventsForRange = (startDate: Date, endDate: Date, isFilteredByActiveCalendars: boolean = false): IEvent[] => {
        const events = state.value.events.filter((event: IEvent) => {
            if (getAreDatesWithinRange(event.start, event.end, startDate, endDate, true)) {
                return event;
            }
        }).sort((a, b) => {
            return a.start.getTime() - b.start.getTime();
        });

        if (!isFilteredByActiveCalendars) {
            return events;
        }

        return filterEventsByActiveCalendars(events);
    };

    const getEventsForDate = (date: Date, isFilteredByActiveCalendars: boolean = false, eventList?: IEvent[]): IEvent[] => {
        const source = (eventList) ? eventList : state.value.events;
        const events = source.filter((event: IEvent) => {
            if (getAreDatesWithinRange(event.start, event.end, date, date, true)) {
                return event;
            }
        }).sort((a, b) => a.start.getTime() - b.start.getTime());

        if (!isFilteredByActiveCalendars) {
            return events;
        }

        return filterEventsByActiveCalendars(events);
    };

    const setFocusedEvent = (payload: Partial<IEvent>) => {
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

    const setFocusedDay = (date: Date) => {
        const events = getEventsForDate(date, true);

        state.value.focusedDay = {
            date,
            events,
        };
    };

    const getFocusedDay = () => state.value.focusedDay;

    const cancelEditEvent = () => {
        state.value.isViewingEvent = false;

        if (!state.value.focusedEvent) {
            return;
        }
        state.value.focusedEvent = null;
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
        saveNewEvent(event);
    };

    const saveNewEvent = (event: IEvent) => {
        state.value.events.push(event);
        event.dayCount = getDaysInEventCount(event);

        saveState();
    };

    const getRepeatingEventMultilpier = (repeatingUnit: 'daily' | 'weekly' | 'monthlyDate' | 'monthlyWeek' | 'yearly', current: Date) => {
        if (repeatingUnit === 'yearly') {
            const month = current.getMonth();
            const year = current.getFullYear();
            return (month > 1 && getIsLeapYear(year + 1)) ? 366 : 365;
        }

        if (repeatingUnit === 'weekly') {
            return 7;
        }

        if (repeatingUnit === 'daily') {
            return 1;
        }

        if (repeatingUnit === 'monthlyDate') {
            const month = current.getMonth();
            const year = current.getFullYear();
            return getLastDayOfMonth(year, month);
        }
    };

    const addRepeatingSiblings = (event: IEvent) => {
        const endDate = (event.repeatingEnd) ? event.repeatingEnd : dateAddition(event.start, 3650); // default end is 10 years from now

        let startDate = new Date(event.start);
        let siblingEvent;
        let head = 0;

        while (startDate < endDate) {

        }
    };

    const updateEvent = () => {
        state.value.isViewingEvent = false;

        if (!state.value.focusedEvent) {
            console.warn(`ERROR: can not update event`);
            return;
        }

        const focusedEvent = state.value.focusedEvent;

        focusedEvent.dayCount = getDaysInEventCount(focusedEvent as IEvent);
        focusedEvent.isAllDay = getIsAllDay(focusedEvent);

        state.value.events = state.value.events.map((event: IEvent) => {
            if (event.id === focusedEvent.id) {

                if (event.isRepeating) {
                    updateRepeatingSiblings(event, focusedEvent as IEvent);
                }

                return {
                    ...event,
                    ...focusedEvent!,
                }
            }
            return event;
        });

        state.value.focusedEvent = focusedEvent;

        saveState();
    };

    const updateRepeatingSiblings = (oldEvent: IEvent, newEvent: IEvent) => {
        if (!oldEvent.repeatingId) {
            return;
        }

        if (newEvent.isRepeating) {
            // event is no longer repeating, get rid of other instances
            deleteRepeatingSiblings(oldEvent.repeatingId, oldEvent.id);
            return;
        }

        if (oldEvent.repeatingQuantity === newEvent.repeatingQuantity && oldEvent.repeatingUnit === newEvent.repeatingUnit) {
            // there was nothing changed, no further action needed
            return;
        }

        deleteRepeatingSiblings(oldEvent.repeatingId, oldEvent.id);

    };

    const deleteEvent = (repeatingDeleteType?: 'none' | 'future' | 'all') => {
        state.value.isViewingEvent = false;

        if (!state.value.focusedEvent || !state.value.focusedEvent.id) {
            console.warn(`ERROR: can not delete event`);
            return;
        }

        const focusedEvent = state.value.focusedEvent;

        if (repeatingDeleteType === 'future' || repeatingDeleteType === 'all') {
            if (repeatingDeleteType === 'future') {
                deleteFutureRepeatingSiblings(focusedEvent.repeatingId!, focusedEvent.start!);
            } else {
                deleteRepeatingSiblings(focusedEvent.repeatingId!, focusedEvent.id!)
            }
        }

        state.value.events = state.value.events.filter(event => event.id !== focusedEvent.id);
        saveState();
    };

    const deleteRepeatingSiblings = (repeatingId: number, focusedId: number) => {
        state.value.events = state.value.events.filter(event => event.id === focusedId || event.repeatingId !== repeatingId);
    }

    const deleteFutureRepeatingSiblings = (repeatingId: number, startDate: Date) => {
        state.value.events = state.value.events.filter(event => event.repeatingId !== repeatingId || event.start.getTime() < startDate.getTime());
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
        if (!event.start || !event.end) {
            return true;
        }
        const startHour = event.start.getHours();
        const endHour = event.end.getHours();

        return startHour === 0 && endHour === 0;
    };

    const getIsFullOrMultiDayEvent = (event: Partial<IEvent>) => {
        if (!event.start || !event.end) {
            return false;
        }

        const { start, end } = event;

        if (getDifferenceInDays(start, end) > 1) {
            return true;
        }

        const startHour = event.start.getHours();
        const endHour = event.end.getHours();

        return startHour === 0 && endHour === 0;
    };

    const getIsEventWithTimes = (event: Partial<IEvent>) => {
        if (!event.start || !event.end) {
            return false;
        }

        const { start, end } = event;

        const startHour = start.getHours();
        const startMinutes = start.getMinutes();
        const endHour = end.getHours();
        const endMinutes = end.getMinutes();

        return startHour !== 0 || startMinutes !== 0 || endHour !== 0 || endMinutes !== 0;
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

        return (start.getFullYear() === end.getFullYear()) && (start.getMonth() === end.getMonth()) && (start.getDate() === end.getDate());
    };

    const getDaysInEventInDateRangeCount = (event: IEvent, dates: Date[]) => {
        let count = 0;

        const start = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
        const end = (event.start === event.end) ? start : new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());

        dates.forEach(date => {
            if (date >= start && date <= end) {
                count++;
            }
        });

        return count;
    };

    const saveState = () => {
        const events = serializeEvents();
        const calendars = state.value.calendars;

        const serialized = {
            events,
            calendars,
        };
        save<ISerializedEventState>(LOCAL_STORAGE_KEY, serialized);
    };

    return {
        getCalendarNames,
        getEventCalendars,
        setCalendarActive,
        getEventsForRange,
        getEventsForDate,
        createEvent,
        addEvent,
        setFocusedEvent,
        setFocusedDay,
        getFocusedDay,
        cancelEditEvent,
        updateEvent,
        deleteEvent,
        getisViewingEvent,
        setIsViewingEvent,
        getFocusedEvent,
        getIsFullDayEvent,
        getIsEventWithTimes,
        getIsFullOrMultiDayEvent,
        getIsSameDayEvent,
        getDaysInEventCount,
        getDaysInEventInDateRangeCount,
    };
});
