import type { CalendarLayout } from '@/enum/CalendarLayout';
import type { IDateIndices, IYearData } from '.';

export interface IBaseCalendarState {
    layout: CalendarLayout;
    year: number;
    month: number;
    week: number;
    dayOfWeek: number;
}

export type Dictionary<T> = { [key: string]: T; };

export default interface ICalendarState extends IBaseCalendarState {
    todayIndices: IDateIndices;
    currentMonth: Date[];
    yearData: Dictionary<IYearData>;
}
