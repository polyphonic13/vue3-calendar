import type {
    IDateIndices,
    IDayInfo,
    IMonthData,
    IMonthInfo,
    IWeekInfo,
    IYearData,
    IYearMonthDay,
} from '../interfaces';

export const DAYS_OF_WEEK = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export const DAYS_IN_MONTH = [
    31,
    28, // need to account for leap year
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
];

export const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => {
    return new Date(0, i).toLocaleString('en-US', { month: 'long' });
});

export const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturay',
];

export const SHORT_DAY_NAMES = [
    'SUN',
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
];

export const TIMES_IN_DAY = [
    '12 AM',
    '1 AM',
    '2 AM',
    '3 AM',
    '4 AM',
    '5 AM',
    '6 AM',
    '7 AM',
    '8 AM',
    '9 AM',
    '10 AM',
    '11 AM',
    '12 PM',
    '1 PM',
    '2 PM',
    '3 PM',
    '4 PM',
    '5 PM',
    '6 PM',
    '7 PM',
    '8 PM',
    '9 PM',
    '10 PM',
    '11 PM',
];

const MILLISECONDS_IN_DAY = 86400000;

export function useDateUtils() {
    const getYMDFromDate = (date: Date): IYearMonthDay => {
        return {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
        };
    };

    const getWeekData = (months: IMonthData[]) => {
        const weeks: Date[][] = [];

        let week: Date[] = Array.from({ length: DAYS_OF_WEEK.length });
        let day: Date;

        for (let m = 0; m < months.length; m++) {
            for (let d = 0; d < months[m].days.length; d++) {
                day = months[m].days[d];
                if (day.getDay() === 0 && d > 0) {
                    weeks.push(week);
                    week = Array.from({ length: DAYS_OF_WEEK.length });
                }
                week[day.getDay()] = day;
            }
        }

        if (week[0]) {
            weeks.push(week);
        }

        if (!weeks[0][0]) {
            const previousYear = weeks[1][0].getFullYear() - 1;
            const previousYearEnd = new Date(previousYear, MONTH_NAMES.length, 0);
            let endOfYearDate = previousYearEnd.getDate();
            const endOfYearDay = previousYearEnd.getDay();

            for (let i = endOfYearDay; i >= 0; i--) {
                day = new Date(previousYear, MONTH_NAMES.length - 1, endOfYearDate);
                weeks[0][i] = day;
                endOfYearDate--;
            }
        }

        if (!weeks[weeks.length - 1][DAYS_OF_WEEK.length - 1]) {
            const lastWeekIndex = weeks.length - 1;
            const nextYear = weeks[lastWeekIndex][0].getFullYear() + 1;
            const nextYearBeginning = new Date(nextYear, 0, 1);
            let beginningOfYearDate = 1;
            const beginningOfYearDay = nextYearBeginning.getDay();

            for (let i = beginningOfYearDay; i < DAYS_OF_WEEK.length; i++) {
                day = new Date(nextYear, 0, beginningOfYearDate);
                weeks[lastWeekIndex][i] = day;
                beginningOfYearDate++;
            }

        }
        return weeks;
    };

    const getMonthData = (month: number, year: number) => {
        return Array.from(
            { length: new Date(year, month, 0).getDate() },
            (_, i) => new Date(year, month - 1, i + 1)
        );
    };

    const getYearData = (year: number): IYearData => {
        const months: IMonthData[] = [];
        MONTH_NAMES.forEach((_, m) => {
            months.push({
                days: getMonthData(m + 1, year),
            });
        });

        const weeks = getWeekData(months);

        return {
            year,
            months,
            weeks,
        };
    };

    const getTodayIndices = (yearData: IYearData): IDateIndices => {
        const today = new Date();
        let todayIndices = {
            month: -1,
            week: -1,
            day: -1,
        };

        if (yearData.year !== today.getFullYear()) {
            return todayIndices;
        }

        yearData.weeks.forEach((week, w) => {
            week.forEach((day) => {
                if (day.getMonth() === today.getMonth() && day.getDate() === today.getDate()) {
                    todayIndices = {
                        month: day.getMonth(),
                        week: w,
                        day: day.getDay(),
                    };
                }
            });
        });

        return todayIndices;
    };

    const getPrevWeek = (y: number, m: number, d: number): IYearMonthDay => {
        const current = new Date(y, m, d);
        const result = new Date(current.setDate(current.getDate() - 7));
        return convertDateToYMD(result);
    };

    const getNextWeek = (y: number, m: number, d: number): IYearMonthDay => {
        const current = new Date(y, m, d);
        const result = new Date(current.setDate(current.getDate() + 7));
        return convertDateToYMD(result);
    };

    const convertDateToYMD = (seed: Date): IYearMonthDay => {
        const year = seed.getFullYear();
        const month = seed.getMonth();
        const day = seed.getDate();
        return {
            year,
            month,
            day,
        };

    }

    const convertNumberToTimeString = (source: number) => {
        const suffix = (Math.floor(source) > 11) ? 'PM' : 'AM';
        let hour = Math.floor(source % 12);

        const minNum = Math.floor(60 * (source - Math.floor(source)));
        const minute = (minNum < 10) ? `0${minNum}` : minNum;

        if (hour === 0) {
            hour = 12;
        }

        return `${hour}:${minute} ${suffix}`;
    };

    const convertYMDToDateString = (value: IYearMonthDay) => {
        const { year, month, day } = value;
        const date = new Date(year, month, day);
        return `${DAYS_OF_WEEK[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
    };

    const getAreDatesWithinRange = (startDate: IYearMonthDay, endDate: IYearMonthDay, rangeStart: IYearMonthDay, rangeEnd: IYearMonthDay, isGreedy: boolean = false) => {
        const vStart = new Date(startDate.year, startDate.month, startDate.day).getTime();
        const vEnd = new Date(endDate.year, endDate.month, endDate.day).getTime();
        const rStart = new Date(rangeStart.year, rangeStart.month, rangeStart.day).getTime();
        const rEnd = new Date(rangeEnd.year, rangeEnd.month, rangeEnd.day).getTime();

        if (!isGreedy) {
            return (vStart >= rStart && vEnd <= rEnd);
        }

        return ((vEnd >= rStart && vEnd <= rEnd) || (vStart <= rEnd && vStart >= rStart));
    };

    const getDifferenceInDays = (start: Date, end: Date, rStart?: Date, rEnd?: Date) => {
        const startTime = start.getTime();
        const endTime = end.getTime();

        if (!rStart && !rEnd) {
            const msDiff = end.getTime() - start.getTime();

            return (msDiff / MILLISECONDS_IN_DAY);
        }

        const rStartTime = rStart!.getTime();
        const rEndTime = rEnd!.getTime();

        const s = (startTime > rStartTime) ? startTime : rStartTime;
        const e = (endTime < rEndTime) ? endTime : rEndTime;

        return ((e - s) / MILLISECONDS_IN_DAY);
    };

    return {
        getYMDFromDate,
        getYearData,
        getTodayIndices,
        getNextWeek,
        getPrevWeek,
        convertDateToYMD,
        convertNumberToTimeString,
        convertYMDToDateString,
        getAreDatesWithinRange,
        getDifferenceInDays,
    };

}
