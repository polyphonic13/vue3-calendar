import type {
    IDateIndices,
    IMonthData,
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

export const SHORT_MONTH_NAMES = Array.from({ length: 12 }, (_, i) => {
    return new Date(0, i).toLocaleString('en-US', { month: 'short' });
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

export const HALF_HOURS_IN_DAY = [
    '12:00 AM',
    '12:30 PM',
    '1:00 AM',
    '1:30 PM',
    '2:00 AM',
    '2:30 PM',
    '3:00 AM',
    '3:30 PM',
    '4:00 AM',
    '4:30 PM',
    '5:00 AM',
    '5:30 PM',
    '6:00 AM',
    '6:30 PM',
    '7:00 AM',
    '7:30 PM',
    '8:00 AM',
    '8:30 PM',
    '9:00 AM',
    '9:30 PM',
    '10:00 AM',
    '10:30 PM',
    '11:00 AM',
    '11:30 PM',
    '12:00 PM',
    '12:30 PM',
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
    '4:00 PM',
    '4:30 PM',
    '5:00 PM',
    '5:30 PM',
    '6:00 PM',
    '6:30 PM',
    '7:00 PM',
    '7:30 PM',
    '8:00 PM',
    '8:30 PM',
    '9:00 PM',
    '9:30 PM',
    '10:00 PM',
    '10:30 PM',
    '11:00 PM',
    '11:30 PM',
];

export const WEEK_OF_MONTH_STRINGS = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
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

    const getDayMDFromDate = (date: Date) => {
        return `${SHORT_DAY_NAMES[date.getDay()]}, ${SHORT_MONTH_NAMES[date.getMonth()].toUpperCase()} ${date.getDate()}`;
    };

    const getWeekData = (months: IMonthData[]) => {
        const weeks: Date[][] = [];

        let week: Date[] = [];
        let day: Date;

        for (let m = 0; m < months.length; m++) {
            for (let d = 0; d < months[m].days.length; d++) {
                day = months[m].days[d];

                if (day.getDay() === 0 && d > 0 || week.length === 7) {
                    weeks.push(week);
                    week = [];
                }

                week.push(day);
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

    const getIsDateToday = (date: Date) => {
        const today = new Date();
        return date.getFullYear() === today.getFullYear() && date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    };

    const convertDateToHHMM = (value: Date, isForDisplay: boolean = true) => {
        if (!isForDisplay) {
            return value.toTimeString().split(' ')[0].substring(0, 5);
        }
        const localTimeString = value.toLocaleTimeString();
        const spaceSplit = localTimeString.split(' ');
        const colonSplit = localTimeString.split(':');

        const hh = (colonSplit[0] === '12' && spaceSplit[1] === 'AM') ? '00' : colonSplit[0];

        return `${hh}:${colonSplit[1]} ${spaceSplit[1]}`;
    };

    const convertDateTimeToNumber = (value: Date) => {
        const hours = value.getHours();
        const minutes = value.getMinutes();

        return hours + (minutes / 60);
    };

    const getAreDatesWithinRange = (startDate: Date, endDate: Date, rangeStart: Date, rangeEnd: Date, isGreedy: boolean = false) => {

        const vStart = startDate.getTime();
        const vEnd = endDate.getTime();
        const rStart = rangeStart.getTime();
        const rEnd = rangeEnd.getTime();

        if (
            rStart === rEnd &&
            startDate.getDate() === rangeStart.getDate() &&
            startDate.getMonth() === rangeStart.getMonth() &&
            startDate.getFullYear() === rangeStart.getFullYear()
        ) {
            return true;
        }

        if (!isGreedy) {
            return (vStart >= rStart && vEnd <= rEnd);
        }

        return ((vEnd >= rStart && vEnd <= rEnd) || (vStart <= rEnd && vStart >= rStart) || (vStart <= rStart && vEnd >= rEnd));
    };

    const getDifferenceInDays = (startDate: Date, endDate: Date, rStart?: Date, rEnd?: Date) => {
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        const startTime = start.getTime();
        const endTime = end.getTime();

        if (!rStart || !rEnd) {
            return (end.getTime() - start.getTime()) / MILLISECONDS_IN_DAY;
        }
        rEnd = dateAddition(rEnd, 1);

        // console.log(`\tstart = ${start}\n\tend = ${end}\n\trStart = ${rStart}\n\trEnd = ${rEnd}`);
        const rStartTime = rStart.getTime();
        const rEndTime = rEnd.getTime();
        // console.log(`\tendTime = ${endTime}, rEndTime = ${rEndTime}`);
        const s = (startTime > rStartTime) ? startTime : rStartTime;
        const e = (endTime < rEndTime) ? endTime : rEndTime;
        const diff = (e - s) / MILLISECONDS_IN_DAY;
        console.log(`\tstartTime = ${startTime}, endTime = ${endTime}\n\trStartTime = ${rStartTime}, rEndTime = ${rEndTime}\n\ts = ${s}, e = ${e}\n\tdiff = ${diff}`);

        return diff;
    };

    const createDateFromDateAndHHMM = (value: Date, hours: number, minutes: number) => {
        return new Date(
            value.getFullYear(),
            value.getMonth(),
            value.getDate(),
            hours,
            minutes,
        );
    };

    const getHHMMFromNumber = (value: number) => {
        const hh = Math.floor(value);
        const minMod = value - hh;
        const mm = minMod * 60;

        return {
            hh,
            mm,
        };
    };

    const dateAddition = (value: Date, dayCount: number) => {
        const temp = new Date(value);
        temp.setDate(temp.getDate() + dayCount);
        return temp;
    };

    const getFirstWeekDayInMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const getWeekOfMonth = (date: Date) => {
        let firstWeekdayIndex = getFirstWeekDayInMonth(date.getFullYear(), date.getMonth());

        if (firstWeekdayIndex < 0) {
            firstWeekdayIndex = 6;
        };

        const offsetDate = date.getDate() + firstWeekdayIndex - 1;
        return Math.floor(offsetDate / 7);
    };

    const getWeekOfMonthString = (date: Date) => {
        return WEEK_OF_MONTH_STRINGS[getWeekOfMonth(date)];
    };

    const getNthWeekdayOfMonth = (weekday: number, n: number, year: number, month: number) => {
        const date = new Date(year, month, 1);
        let count = 0;

        while (true) {
            if (date.getDay() === weekday) {
                if (++count == n) {
                    break;
                }
            }
            date.setDate(date.getDate() + 1);
        }
        return date;
    };


    const getIsLeapYear = (year: number) => {
        return ((year & 3) == 0 && ((year % 25) != 0 || (year & 15) == 0));
        // from https://stackoverflow.com/questions/3220163/how-to-find-leap-year-programmatically-in-c/11595914#11595914
    };

    const getLastDayOfMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    return {
        getYMDFromDate,
        getDayMDFromDate,
        getYearData,
        getIsDateToday,
        getTodayIndices,
        convertDateToHHMM,
        convertDateTimeToNumber,
        getAreDatesWithinRange,
        getDifferenceInDays,
        createDateFromDateAndHHMM,
        getHHMMFromNumber,
        dateAddition,
        getWeekOfMonthString,
        getWeekOfMonth,
        getIsLeapYear,
        getLastDayOfMonth,
        getNthWeekdayOfMonth,
    };

}
