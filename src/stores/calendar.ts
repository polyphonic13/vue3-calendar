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

    const createState = (): ICalendarState => {
        const savedState = load<IBaseCalendarState>(LOCAL_STORAGE_KEY);
        const today = new Date();
        const year = today.getFullYear();
        const yearData: Dictionary<IYearData> = {};

        yearData[year] = getYearData(year);

        const todayIndices = getTodayIndices(yearData[year]);

        if (savedState) {
            return {
                ...savedState,
                yearData,
                todayIndices,
            };
        }

        const month = today.getMonth();

        let week: number = 0;
        let day: number = 0;

        yearData[year].weeks.forEach((wk, w) => {
            wk.forEach((dy, d) => {
                if (dy.getMonth() === today.getMonth() && dy.getDate() === today.getDate()) {
                    week = w;
                    day = d;
                }
            })
        });

        return {
            layout: CalendarLayout.WEEK,
            year,
            month,
            week,
            day,
            yearData,
            todayIndices,
        }
    };

    const state = ref<ICalendarState>(createState());
    console.log(`CalendarStore/createState, state = `, state.value);

    const saveState = () => {
        const { year, month, week, day, layout } = state.value;
        // console.log(`saveState, year = ${year}, month = ${month}, week = ${week}, day = ${day}, layout = ${layout}`);
        save<IBaseCalendarState>(LOCAL_STORAGE_KEY, { year, month, week, day, layout });
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

    const setMonth = (index: number) => {
        state.value.month = index;
        saveState();
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

        state.value = {
            ...state.value,
            month,
            week,
            day,
        };

        saveState();
    };

    const saveWeekAndDayIndices = (indices: { week: number, day: number }) => {
        const { week, day } = indices;

        state.value.week = week;
        state.value.day = day;

        saveState();
    };

    const incrementYear = () => {
        const year = state.value.year++;

        if (!state.value.yearData[year]) {
            state.value.yearData[year] = getYearData(year);
        }

        state.value.year = year;
        state.value.month = 0;

        saveState();
    };

    const decrementYear = () => {
        const year = state.value.year--;

        if (!state.value.yearData[year]) {
            state.value.yearData[year] = getYearData(year);
        }

        state.value.year = year;
        state.value.month = MONTH_NAMES.length - 1;

        saveState();
    };

    const incrementMonth = () => {
        state.value.week = 0;
        state.value.day = 0;

        if (state.value.month < MONTH_NAMES.length - 1) {
            state.value.month++;
            saveState();
            return;
        }

        incrementYear();
    };

    const decrementMonth = () => {
        state.value.day = 0;

        if (state.value.month > 0) {
            state.value.month--;
            saveState();
            return;
        }

        decrementYear();
    };

    const incrementWeek = () => {
        state.value.day = 0;

        if (state.value.week < state.value.yearData[state.value.year].weeks.length - 1) {
            state.value.week++;
            state.value.month = state.value.yearData[state.value.year].weeks[state.value.week][state.value.day].getMonth();
            saveState();
            return;
        }
        // console.log(`week at last entry, going to increment month`);
        incrementYear();
        saveState();
    };

    const decrementWeek = () => {
        state.value.day = 0;

        if (state.value.week > 0) {
            state.value.week--;
            state.value.month = state.value.yearData[state.value.year].weeks[state.value.week][state.value.day].getMonth();
            saveState();
            return;
        }

        decrementYear();
        saveState();
    };

    const incrementDay = () => {
        if (state.value.day < DAYS_OF_WEEK.length) {
            state.value.day++;
            saveState();
            return;
        }

        state.value.day = 0;

        if (state.value.week < state.value.yearData[state.value.year].weeks.length - 1) {
            state.value.week++;
            state.value.month = state.value.yearData[state.value.year].weeks[state.value.week][state.value.day].getMonth();
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
        if (state.value.day > 0) {
            state.value.day--;
            saveState();
            return;
        }

        state.value.day = DAYS_OF_WEEK.length - 1;

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
        setWeek,
        getWeekForDate,
        setDay,
        setInfoToToday,
        increment,
        decrement,
    };
});
