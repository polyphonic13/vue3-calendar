import type { IEvent } from '.';

export default interface IEventState {
    events: IEvent[];
    isViewingEvent: boolean;
    focusedEvent: Partial<IEvent> | null;
}
