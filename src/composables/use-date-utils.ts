import type {
    IDateIndices,
    IDayInfo,
    IMonthInfo,
    IWeekInfo,
    IYearMonthDay,
} from '../interfaces';

export function useDateUtils() {
    const DAYS_OF_WEEK = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
    ];

    const DAYS_IN_MONTH = [
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

    const MONTH_NAMES = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    const DAY_NAMES = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturay',
    ];

    const SHORT_DAY_NAMES = [
        'SUN',
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
        'SAT',
    ];

    const TIMES_IN_DAY = [
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
    ]

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
                if (weekInfo.days[j].date === thisDate && weekInfo.days[j].month === thisMonth) {
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

                if (dayInfo.month === month && dayInfo.date >= lastDayOfMonth) {
                    currentLastMonth++;
                    break;
                }
            }

            if (currentLastMonth > month) {
                break;
            }

            lastDayInfo = weekInfo.days[weekInfo.days.length - 1];

            currentWeekStart = lastDayInfo.date + 1;
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

    const getDatesForWeeks = (year: number, month: number, date: number): IWeekInfo => {
        // console.log(`>>>>> getDatesForWeeks, args = ${year}, ${month}, ${date}`);
        const target = new Date(year, month, date);
        const dayOfWeek = target.getDay();
        let days: IDayInfo[] = [];
        const endOfMonth = getDaysInMonth(year, month);
        const weekNumber = getWeekNumber(year, month, date);
        // console.log(`\ttarget = `, target);
        // console.log(`\tdayOfWeek = ${dayOfWeek}\n\tendOfMonth = ${endOfMonth}\n\tweekNumber = ${weekNumber}`);

        if (dayOfWeek > 0) {
            if (date === 1) {
                // pad week from previous month
                const previousMonth = (month > 0) ? month - 1 : MONTH_NAMES.length - 1;
                const endDayOfPreviousMonth = getDaysInMonth(year, previousMonth);
                let date = (endDayOfPreviousMonth - (dayOfWeek - 1));
                // console.log(`\tendDayOfPreviousMonth = ${endDayOfPreviousMonth}, date now = ${date}`);

                while (date < (endDayOfPreviousMonth + 1)) {
                    days.push({
                        date,
                        month: previousMonth,
                    });
                    date++;
                    // console.log(`\tdate now ${date}`);
                }
            } else {
                // pad beginning of week with past days
                let start = date - dayOfWeek;
                while (start < date) {
                    days.push({
                        date: start,
                        month,
                    })
                    start++;
                }
            }
        }
        // // console.log(`\tdate = ${date}`);
        while (date < (endOfMonth + 1) && days.length < 7) {
            days.push({
                date,
                month,
            });
            date++;
        }

        if (days.length < 7) {
            // add beginning days from next month
            const nextMonth = (month < MONTH_NAMES.length - 1) ? month + 1 : 0;
            date = 1;

            while (days.length < 7) {
                days.push({
                    date,
                    month: nextMonth,
                });
                date++;
            }
        }

        days = days.map((day: IDayInfo, d: number) => {
            return {
                ...day,
                dayName: SHORT_DAY_NAMES[d],
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

    return {
        DAYS_OF_WEEK,
        DAYS_IN_MONTH,
        MONTH_NAMES,
        DAY_NAMES,
        SHORT_DAY_NAMES,
        TIMES_IN_DAY,
        getMonthInfo,
        getMonthInfoForToday,
        getDatesForWeeks,
        getWeekNumber,
        getNextWeek,
        getPrevWeek,
        convertDateToYMD,
    };

}
