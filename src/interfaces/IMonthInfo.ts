import type IDateIndices from './IDateIndices';
import type IDayInfo from './IDayInfo';
import type IWeekInfo from './IWeekInfo';

export default interface IMonthInfo {
    year: number;
    month: number;
    days: IDayInfo[];
    weeks: IWeekInfo[];
    monthName: string;
    todayIndices: IDateIndices;
}
