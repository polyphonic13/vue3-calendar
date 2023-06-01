import type IMonthData from './IMonthData';

export default interface IYearData {
    year: number;
    months: IMonthData[];
    weeks: Date[][];
}
