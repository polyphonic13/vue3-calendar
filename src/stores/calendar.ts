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
        if (!state.value.yearData[year]) {
            state.value.yearData[year] = getYearData(year);
        }

        const yearData = state.value.yearData[year];

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
                if (!state.value.yearData[nextYear]) {
                    state.value.yearData[nextYear] = getYearData(nextYear);
                }
                weeks.push(state.value.yearData[nextYear].weeks[0]);
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

    const state = ref<ICalendarState>(createState());
    console.log(`CalendarStore/createState, state = `, state.value);

    const saveState = () => {
        const { year, month, week, dayOfWeek, layout } = state.value;
        // console.log(`saveState, year = ${year}, month = ${month}, week = ${week}, dayOfWeek = ${dayOfWeek}, layout = ${layout}`);
        save<IBaseCalendarState>(LOCAL_STORAGE_KEY, { year, month, week, dayOfWeek, layout });
    };

    const setLayout = (value: CalendarLayout) => {
        state.value.layout = value;

        if (value !== CalendarLayout.DAY) {
            saveState();
            return;
        }

        const { month, week, day } = state.value.todayIndices;

        if (month === -1 || week === -1 || day === -1) {
            saveWeekAndDayIndices({ week: 0, day: 0 });
            return;
        }

        saveWeekAndDayIndices({ week, day });
        saveState();
    };

    const getCurrentYear = () => {
        return state.value.yearData[state.value.year];
    };

    const setMonth = (value: number) => {
        state.value.month = value;
        state.value.currentMonth = getDaysForMonth(value, getCurrentYear());
        saveState();
    };

    const getMonthForYear = (year: number, month: number) => {
        if (!state.value.yearData[year]) {
            state.value.yearData[year] = getYearData(year);
        }

        return getDaysForMonth(month, state.value.yearData[year]);
    };

    const setWeek = (index: number) => {
        state.value.week = index;
        saveState();
    };

    const getWeekForDate = (target: Date) => {
        const year = target.getFullYear();
        const date = target.getDate();
        const month = target.getMonth();

        if (!state.value.yearData[year]) {
            state.value.yearData[year] = getYearData(year);
        }

        const yearData = state.value.yearData[year];

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
        const { month, week, day } = state.value.todayIndices;
        const year = new Date().getFullYear();

        state.value = {
            ...state.value,
            month,
            week,
            year,
            dayOfWeek: day,
        };

        setMonth(month);

        saveState();
    };

    const saveWeekAndDayIndices = (indices: { week: number, day: number }) => {
        const { week, day } = indices;

        state.value.week = week;
        state.value.dayOfWeek = day;

        saveState();
    };

    const incrementYear = () => {
        const year = state.value.year + 1;

        if (!state.value.yearData[year]) {
            state.value.yearData[year] = getYearData(year);
        }

        state.value.year = year;
        setMonth(0);

        saveState();
    };

    const decrementYear = () => {
        const year = state.value.year - 1;

        if (!state.value.yearData[year]) {
            state.value.yearData[year] = getYearData(year);
        }

        state.value.year = year;
        setMonth(MONTH_NAMES.length - 1);

        saveState();
    };

    const incrementMonth = () => {
        state.value.week = 0;
        state.value.dayOfWeek = 0;

        if (state.value.month < MONTH_NAMES.length - 1) {
            setMonth(state.value.month + 1);
            saveState();
            return;
        }

        incrementYear();
    };

    const decrementMonth = () => {
        state.value.dayOfWeek = 0;

        if (state.value.month > 0) {
            setMonth(state.value.month - 1);
            saveState();
            return;
        }

        decrementYear();
    };

    const incrementWeek = () => {
        state.value.dayOfWeek = 0;

        if (state.value.week < getCurrentYear().weeks.length - 1) {
            state.value.week++;
            state.value.month = getCurrentYear().weeks[state.value.week][state.value.dayOfWeek].getMonth();
            saveState();
            return;
        }
        // console.log(`week at last entry, going to increment month`);
        incrementYear();
        saveState();
    };

    const decrementWeek = () => {
        state.value.dayOfWeek = 0;

        if (state.value.week > 0) {
            state.value.week--;
            state.value.month = getCurrentYear().weeks[state.value.week][state.value.dayOfWeek].getMonth();
            saveState();
            return;
        }

        decrementYear();
        saveState();
    };

    const incrementDay = () => {
        if (state.value.dayOfWeek < DAYS_OF_WEEK.length) {
            state.value.dayOfWeek++;
            saveState();
            return;
        }

        state.value.dayOfWeek = 0;

        if (state.value.week < getCurrentYear().weeks.length - 1) {
            state.value.week++;
            state.value.month = getCurrentYear().weeks[state.value.week][state.value.dayOfWeek].getMonth();
        } else {
            state.value.week = 0;

            const year = state.value.year++;

            if (state.value.yearData[year]) {
                state.value.yearData[year] = getYearData(year);
                state.value.month = state.value.yearData[year].weeks[0][0].getMonth();
            }
        }

        saveState();
    };

    const decrementDay = () => {
        if (state.value.dayOfWeek > 0) {
            state.value.dayOfWeek--;
            saveState();
            return;
        }

        state.value.dayOfWeek = DAYS_OF_WEEK.length - 1;

        if (state.value.week = 0) {
            const year = state.value.year--;

            if (!state.value.yearData[year]) {
                state.value.yearData[year] = getYearData(year);
            }

            const weeks = state.value.yearData[year].weeks;

            state.value.week = weeks.length - 1;
            state.value.month = weeks[state.value.week][0].getMonth();
        }

        saveState();
    };

    const INCREMENT_METHODS = {
        [CalendarLayout.YEAR]: incrementYear,
        [CalendarLayout.MONTH]: incrementMonth,
        [CalendarLayout.WEEK]: incrementWeek,
        [CalendarLayout.DAY]: incrementDay,
    };

    const increment = () => {
        INCREMENT_METHODS[state.value.layout]();
    };

    const DECREMENT_METHODS = {
        [CalendarLayout.YEAR]: decrementYear,
        [CalendarLayout.MONTH]: decrementMonth,
        [CalendarLayout.WEEK]: decrementWeek,
        [CalendarLayout.DAY]: decrementDay,
    };

    const decrement = () => {
        DECREMENT_METHODS[state.value.layout]();
    };

    return {
        state,
        setLayout,
        setMonth,
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
