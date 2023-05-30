import type { IYearMonthDayTime } from '.';

export default interface IEvent {
    id: number;
    start: IYearMonthDayTime;
    end: IYearMonthDayTime;
    title: string;
    description: string;
    location: string;
}
