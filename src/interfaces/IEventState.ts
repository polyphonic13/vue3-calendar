import type {
    IEvent,
    IEventCalendar,
    ISerializedEvent,
} from '.';

export interface ISerializedEventState {
    events: ISerializedEvent[];
    calendars: IEventCalendar[];
};

export default interface IEventState {
    events: IEvent[];
    isViewingEvent: boolean;
    calendars: IEventCalendar[];
    focusedEvent: Partial<IEvent> | null;
    focusedDay: {
        date: Date,
        events: IEvent[],
    } | null;
}
