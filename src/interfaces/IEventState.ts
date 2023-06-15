import type { IEvent, ISerializedEvent } from '.';

export interface ISerializedEventState {
    events: ISerializedEvent[];
};

export default interface IEventState {
    events: IEvent[];
    isViewingEvent: boolean;
    focusedEvent: Partial<IEvent> | null;
    focusedDay: {
        date: Date,
        events: IEvent[],
    } | null;
}
