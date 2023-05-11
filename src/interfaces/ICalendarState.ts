import type { CalendarLayout } from '@/enum/CalendarLayout';
import type { IMonthInfo } from '.';

export default interface ICalendarState {
    layout: CalendarLayout;
    monthInfo: IMonthInfo;
    year: number;
    monthIndex: number;
    weekIndex: number;
    dayIndex: number;
}
