import type { CalendarLayout } from '@/enum/CalendarLayout';
import type { IMonthInfo, IYearData } from '.';

export interface IBaseCalendarState {
    layout: CalendarLayout;
    year: number;
    month: number;
    week: number;
    day: number;
}

export default interface ICalendarState extends IBaseCalendarState {
    monthInfo: IMonthInfo;
    yearData: IYearData[];
}
