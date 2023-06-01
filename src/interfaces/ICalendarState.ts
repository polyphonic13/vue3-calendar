import type { CalendarLayout } from '@/enum/CalendarLayout';
import type { IDateIndices, IMonthInfo, IYearData } from '.';

export interface IBaseCalendarState {
    layout: CalendarLayout;
    year: number;
    month: number;
    week: number;
    day: number;
}

export type Dictionary<T> = { [key: string]: T; };

export default interface ICalendarState extends IBaseCalendarState {
    todayIndices: IDateIndices;
    yearData: Dictionary<IYearData>;
}
