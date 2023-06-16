import type { IEvent } from '.';

export default interface ICalendar {
    name: string;
    events: IEvent[];
}
