import type { IEvent } from '.';

export default interface IEventState {
    events: IEvent[];
    isEditingEvent: boolean;
    focusedEvent: Partial<IEvent> | null;
}
