import type {
    IDateIndices,
    IDayInfo,
    IMonthInfo,
    INumberRange,
    IWeekInfo,
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

// export const MONTH_NAMES = [
//     'January',
//     'February',
//     'March',
//     'April',
//     'May',
//     'June',
//     'July',
//     'August',
//     'September',
//     'October',
//     'November',
//     'December'
// ];

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
    const getDaysInMonth = (year: number, month: number) => {
        if (month !== 1) {
            return DAYS_IN_MONTH[month];
        }

        // february
        return (year % 4 === 0) ? 29 : 28;
    }

    const getTodayIndices = (monthInfo: IMonthInfo, year: number): IDateIndices => {
        const today = new Date();
        if (year !== today.getFullYear()) {
            // // console.log(`not the right year`);
            return { month: -1, week: -1, day: -1 };
        }

        if (MONTH_NAMES[today.getMonth()] !== monthInfo.monthName) {
            // // console.log(`not the right month`);
            return { month: -1, week: -1, day: -1 };
        }

        let weekInfo: IWeekInfo;
        const thisDate = today.getDate();
        const thisMonth = today.getMonth();

        for (let i = 0; i < monthInfo.weeks.length; i++) {
            weekInfo = monthInfo.weeks[i];
            for (let j = 0; j < weekInfo.days.length; j++) {
                // // console.log(`\tweek ${i}, day ${j} date = ${weekInfo.days[j].date}`);
                if (weekInfo.days[j].day === thisDate && weekInfo.days[j].month === thisMonth) {
                    return { month: thisMonth, week: i, day: j };
                }
            }
        }

        return { month: -1, week: -1, day: -1 };
    };

    const getMonthInfoForToday = (): IMonthInfo => {
        const today = new Date();
        return getMonthInfo(today.getFullYear(), today.getMonth());
    };

    const getMonthInfo = (year: number, month: number): IMonthInfo => {
        const monthInfo: IMonthInfo = {
            year,
            month,
            monthName: MONTH_NAMES[month],
            days: [],
            weeks: [],
            todayIndices: {
                month: -1,
                week: -1,
                day: -1,
            },
        };

        const lastDayOfMonth = getDaysInMonth(year, month);

        let currentWeekStart = 1;
        let currentLastMonth = month;
        let weekInfo: IWeekInfo;
        let lastDayInfo: IDayInfo;
        let dayInfo: IDayInfo;

        while (currentLastMonth === month) {
            weekInfo = getDatesForWeeks(year, month, currentWeekStart);
            monthInfo.weeks.push(weekInfo);

            for (let i = 0; i < weekInfo.days.length; i++) {
                dayInfo = weekInfo.days[i];

                if (dayInfo.month === month && dayInfo.day >= lastDayOfMonth) {
                    currentLastMonth++;
                    break;
                }
            }

            if (currentLastMonth > month) {
                break;
            }

            lastDayInfo = weekInfo.days[weekInfo.days.length - 1];

            currentWeekStart = lastDayInfo.day + 1;
            currentLastMonth = lastDayInfo.month;
        }

        monthInfo.todayIndices = getTodayIndices(monthInfo, year);

        monthInfo.weeks.forEach((week) => {
            week.days.forEach((day) => {
                monthInfo.days.push(day);
            });
        });

        return monthInfo;
    }

    const getDatesForWeeks = (year: number, month: number, day: number): IWeekInfo => {
        // console.log(`>>>>> getDatesForWeeks, args = ${year}, ${month}, ${date}`);
        const target = new Date(year, month, day);
        const dayOfWeek = target.getDay();
        let days: IDayInfo[] = [];
        const endOfMonth = getDaysInMonth(year, month);
        const weekNumber = getWeekNumber(year, month, day);
        // console.log(`\ttarget = `, target);
        // console.log(`\tdayOfWeek = ${dayOfWeek}\n\tendOfMonth = ${endOfMonth}\n\tweekNumber = ${weekNumber}`);

        if (dayOfWeek > 0) {
            if (day === 1) {
                // pad week from previous month
                const previousMonth = (month > 0) ? month - 1 : MONTH_NAMES.length - 1;
                const endDayOfPreviousMonth = getDaysInMonth(year, previousMonth);
                let date = (endDayOfPreviousMonth - (dayOfWeek - 1));
                // console.log(`\tendDayOfPreviousMonth = ${endDayOfPreviousMonth}, date now = ${date}`);

                while (date < (endDayOfPreviousMonth + 1)) {
                    days.push({
                        day,
                        month: previousMonth,
                        year,
                    });
                    date++;
                    // console.log(`\tdate now ${date}`);
                }
            } else {
                // pad beginning of week with past days
                let start = day - dayOfWeek;
                while (start < day) {
                    days.push({
                        day: start,
                        month,
                        year,
                    })
                    start++;
                }
            }
        }
        // // console.log(`\tdate = ${date}`);
        while (day < (endOfMonth + 1) && days.length < 7) {
            days.push({
                day,
                month,
                year,
            });
            day++;
        }

        if (days.length < 7) {
            // add beginning days from next month
            const nextMonth = (month < MONTH_NAMES.length - 1) ? month + 1 : 0;
            day = 1;

            while (days.length < 7) {
                days.push({
                    day,
                    month: nextMonth,
                    year,
                });
                day++;
            }
        }

        days = days.map((day: IDayInfo, d: number) => {
            return {
                ...day,
                dayName: SHORT_DAY_NAMES[d],
                year,
            };
        });

        // console.log(`\tdays.length = ${days.length}, days = ${JSON.stringify(days)}`);
        const weekInfo: IWeekInfo = {
            days,
            weekNumber,
        };

        return weekInfo;
    }

    const getWeekNumber = (year: number, month: number, day: number) => {
        const target = new Date(year, month, day);
        const startOfYear = new Date(target.getFullYear(), 0, 1);
        const week = Math.ceil((((target.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
        return week;
    }

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

    const getAreDatesWithinRange = (startDate: IYearMonthDay, endDate: IYearMonthDay, rangeStart: IYearMonthDay, rangeEnd: IYearMonthDay) => {
        const rStart = new Date(rangeStart.year, rangeStart.month, rangeStart.day).getTime();
        const rEnd = new Date(rangeEnd.year, rangeEnd.month, rangeEnd.day).getTime();
        const vStart = new Date(startDate.year, startDate.month, startDate.day).getTime();
        const vEnd = new Date(endDate.year, endDate.month, endDate.day).getTime();

        return (vStart >= rStart && vEnd <= rEnd);
    };

    const getDifferenceInDays = (start: IYearMonthDay, end: IYearMonthDay) => {
        if (start.year === end.year && start.month === end.month) {
            return end.day - start.day;
        }

        const startDate = new Date(start.year, start.month, start.day).getTime();
        const endDate = new Date(end.year, end.month, end.day).getTime();
        const msDiff = endDate - startDate;

        return (msDiff / MILLISECONDS_IN_DAY);
    };

    return {
        getMonthInfo,
        getMonthInfoForToday,
        getDatesForWeeks,
        getWeekNumber,
        getNextWeek,
        getPrevWeek,
        convertDateToYMD,
        convertNumberToTimeString,
        convertYMDToDateString,
        getAreDatesWithinRange,
        getDifferenceInDays,
    };

}
