import { ref } from 'vue';
import { defineStore } from 'pinia';

import { CalendarLayout } from '@/enum/CalendarLayout';

import { useLocalStorage } from '@/composables/use-local-storage';
import { useDateUtils, MONTH_NAMES, DAYS_OF_WEEK } from '@/composables/use-date-utils';

import type {
    IBaseCalendarState,
    ICalendarState,
    IYearData,
} from '@/interfaces';
import type { Dictionary } from '@/@types';

const LOCAL_STORAGE_KEY = 'calendarAppCalendarData';

const { getYearData, getTodayIndices } = useDateUtils();
const { load, save } = useLocalStorage();

export const useCalendarStore = defineStore('calendar', () => {

    const getDaysForMonth = (month: number, yearData: IYearData) => {
        let days: Date[] = [];

        yearData.weeks.forEach((week) => {
            if (week.findIndex((day: Date) => day.getMonth() === month && day.getFullYear() === yearData.year) > -1) {
                days = [...days, ...week];
            }
        });

        return days;
    };

    const getWeeksForMonth = (month: number, year: number) => {
        if (!calendarState.value.yearData[year]) {
            calendarState.value.yearData[year] = getYearData(year);
        }

        const yearData = calendarState.value.yearData[year];

        let weeks: Date[][] = [];
        let index = 0;
        yearData.weeks.forEach((week, w) => {
            if (week.findIndex((day) => day.getMonth() === month) > -1) {
                weeks.push(week);
                index = w;
            }
        });

        if (weeks.length < 5) {
            if (index < yearData.weeks.length - 1) {
                index++;
                weeks.push(yearData.weeks[index]);
            } else {
                const nextYear = year + 1;
                if (!calendarState.value.yearData[nextYear]) {
                    calendarState.value.yearData[nextYear] = getYearData(nextYear);
                }
                weeks.push(calendarState.value.yearData[nextYear].weeks[0]);
            }
        }

        return weeks;
    };

    const createState = (): ICalendarState => {
        const savedState = load<IBaseCalendarState>(LOCAL_STORAGE_KEY);
        const today = new Date();

        const yearData: Dictionary<IYearData> = {};

        const month = (savedState) ? savedState.month : today.getMonth();
        const year = (savedState) ? savedState.year : today.getFullYear();

        yearData[year] = getYearData(year);

        const todayIndices = getTodayIndices(yearData[year]);
        const currentMonth = getDaysForMonth(month, yearData[year]);


        if (savedState) {
            return {
                ...savedState,
                yearData,
                todayIndices,
                currentMonth,
            };
        }

        const todayDate = today.getDate();

        let week = 0;
        let dayOfWeek = 0;

        yearData[year].weeks.forEach((wk, w) => {
            wk.forEach((dy, d) => {
                if (dy.getMonth() === month && dy.getDate() === todayDate) {
                    week = w;
                    dayOfWeek = d;
                }
            })
        });

        return {
            layout: CalendarLayout.WEEK,
            year,
            month,
            week,
            dayOfWeek,
            yearData,
            todayIndices,
            currentMonth,
        }
    };

    const calendarState = ref<ICalendarState>(createState());
    console.log(`CalendarStore/createState, calendarState = `);
    console.log(calendarState.value);

    const saveState = () => {
        const { year, month, week, dayOfWeek, layout } = calendarState.value;
        // console.log(`saveState, year = ${year}, month = ${month}, week = ${week}, dayOfWeek = ${dayOfWeek}, layout = ${layout}`);
        save<IBaseCalendarState>(LOCAL_STORAGE_KEY, { year, month, week, dayOfWeek, layout });
    };

    const setLayout = (value: CalendarLayout) => {
        calendarState.value.layout = value;

        if (value === CalendarLayout.SCHEDULE) {
            console.log(`is schedule, setting info to today`);
            setInfoToToday();
        }

        if (value !== CalendarLayout.DAY) {
            saveState();
            return;
        }

        const { month, week, day } = calendarState.value.todayIndices;

        if (month === -1 || week === -1 || day === -1) {
            // today is not in the current year
            saveWeekAndDayIndices({ week: 0, day: 0 });
            return;
        }

        saveWeekAndDayIndices({ week, day });
        saveState();
    };

    const getCurrentYear = () => {
        return calendarState.value.yearData[calendarState.value.year];
    };

    const getCurrentMonth = () => {
        return calendarState.value.currentMonth;
    };

    const setMonth = (value: number) => {
        calendarState.value.month = value;
        calendarState.value.currentMonth = getDaysForMonth(value, getCurrentYear());
        saveState();
    };

    const getMonthForYear = (year: number, month: number) => {
        if (!calendarState.value.yearData[year]) {
            calendarState.value.yearData[year] = getYearData(year);
        }

        return getDaysForMonth(month, calendarState.value.yearData[year]);
    };

    const setWeek = (index: number) => {
        calendarState.value.week = index;
        saveState();
    };

    const getWeekForDate = (target: Date) => {
        const year = target.getFullYear();
        const date = target.getDate();
        const month = target.getMonth();

        if (!calendarState.value.yearData[year]) {
            calendarState.value.yearData[year] = getYearData(year);
        }

        const yearData = calendarState.value.yearData[year];

        yearData.weeks.forEach((week, w) => {
            week.forEach((day) => {
                if (day.getMonth() === month && day.getDate() === date) {
                    return w;
                }
            });
        });

        return -1;
    };

    const setDay = (indices: { week: number, day: number }) => {
        saveWeekAndDayIndices(indices);
        setLayout(CalendarLayout.DAY);
        saveState();
    };

    const setInfoToToday = () => {
        const { month, week, day } = calendarState.value.todayIndices;
        const year = new Date().getFullYear();

        calendarState.value = {
            ...calendarState.value,
            month,
            week,
            year,
            dayOfWeek: day,
        };

        setMonth(month);

        saveState();
    };

    /**
     * `saveWeekAndDayIndices` updates the states week and dayOfWeek which provide the
     * indices used to reference a date in the states weeks[][] array.
     * @param indices: { week: number, day: number } -- the week and day of week
     */
    const saveWeekAndDayIndices = (indices: { week: number, day: number }) => {
        const { week, day } = indices;

        calendarState.value.week = week;
        calendarState.value.dayOfWeek = day;

        saveState();
    };

    const incrementYear = () => {
        const year = calendarState.value.year + 1;

        if (!calendarState.value.yearData[year]) {
            calendarState.value.yearData[year] = getYearData(year);
        }

        calendarState.value.year = year;
        setMonth(0);

        saveState();
    };

    const decrementYear = () => {
        const year = calendarState.value.year - 1;

        if (!calendarState.value.yearData[year]) {
            calendarState.value.yearData[year] = getYearData(year);
        }

        calendarState.value.year = year;
        setMonth(MONTH_NAMES.length - 1);

        saveState();
    };

    const incrementMonth = () => {
        calendarState.value.week = 0;
        calendarState.value.dayOfWeek = 0;

        if (calendarState.value.month < MONTH_NAMES.length - 1) {
            setMonth(calendarState.value.month + 1);
            saveState();
            return;
        }

        incrementYear();
    };

    const decrementMonth = () => {
        calendarState.value.dayOfWeek = 0;

        if (calendarState.value.month > 0) {
            setMonth(calendarState.value.month - 1);
            saveState();
            return;
        }

        decrementYear();
    };

    const incrementWeek = () => {
        calendarState.value.dayOfWeek = 0;

        if (calendarState.value.week < getCurrentYear().weeks.length - 1) {
            calendarState.value.week++;
            calendarState.value.month = getCurrentYear().weeks[calendarState.value.week][calendarState.value.dayOfWeek].getMonth();
            saveState();
            return;
        }
        // console.log(`week at last entry, going to increment month`);
        incrementYear();
        saveState();
    };

    const decrementWeek = () => {
        calendarState.value.dayOfWeek = 0;

        if (calendarState.value.week > 0) {
            calendarState.value.week--;
            calendarState.value.month = getCurrentYear().weeks[calendarState.value.week][calendarState.value.dayOfWeek].getMonth();
            saveState();
            return;
        }

        decrementYear();
        saveState();
    };

    const incrementDay = () => {
        if (calendarState.value.dayOfWeek < DAYS_OF_WEEK.length) {
            calendarState.value.dayOfWeek++;
            saveState();
            return;
        }

        calendarState.value.dayOfWeek = 0;

        if (calendarState.value.week < getCurrentYear().weeks.length - 1) {
            calendarState.value.week++;
            calendarState.value.month = getCurrentYear().weeks[calendarState.value.week][calendarState.value.dayOfWeek].getMonth();
        } else {
            calendarState.value.week = 0;

            const year = calendarState.value.year++;

            if (calendarState.value.yearData[year]) {
                calendarState.value.yearData[year] = getYearData(year);
                calendarState.value.month = calendarState.value.yearData[year].weeks[0][0].getMonth();
            }
        }

        saveState();
    };

    const decrementDay = () => {
        if (calendarState.value.dayOfWeek > 0) {
            calendarState.value.dayOfWeek--;
            saveState();
            return;
        }

        calendarState.value.dayOfWeek = DAYS_OF_WEEK.length - 1;

        if (calendarState.value.week = 0) {
            const year = calendarState.value.year--;

            if (!calendarState.value.yearData[year]) {
                calendarState.value.yearData[year] = getYearData(year);
            }

            const weeks = calendarState.value.yearData[year].weeks;

            calendarState.value.week = weeks.length - 1;
            calendarState.value.month = weeks[calendarState.value.week][0].getMonth();
        }

        saveState();
    };

    const INCREMENT_METHODS = {
        [CalendarLayout.SCHEDULE]: incrementMonth,
        [CalendarLayout.MONTH]: incrementMonth,
        [CalendarLayout.WEEK]: incrementWeek,
        [CalendarLayout.DAY]: incrementDay,
    };

    const increment = () => {
        INCREMENT_METHODS[calendarState.value.layout]();
    };

    const DECREMENT_METHODS = {
        [CalendarLayout.SCHEDULE]: decrementMonth,
        [CalendarLayout.MONTH]: decrementMonth,
        [CalendarLayout.WEEK]: decrementWeek,
        [CalendarLayout.DAY]: decrementDay,
    };

    const decrement = () => {
        DECREMENT_METHODS[calendarState.value.layout]();
    };

    return {
        calendarState,
        setLayout,
        setMonth,
        getCurrentMonth,
        getMonthForYear,
        getWeeksForMonth,
        setWeek,
        getWeekForDate,
        setDay,
        setInfoToToday,
        increment,
        decrement,
    };
});
