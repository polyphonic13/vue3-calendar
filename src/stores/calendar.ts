import { ref } from 'vue';
import { defineStore } from 'pinia';

import { CalendarLayout } from '@/enum/CalendarLayout';

import { useLocalStorage } from '@/composables/use-local-storage';
import { useDateUtils, MONTH_NAMES } from '@/composables/use-date-utils';

import type { IBaseCalendarState, ICalendarState } from '@/interfaces';

const LOCAL_STORAGE_KEY = 'calendarAppCalendarData';

const { get, set } = useLocalStorage();
const { getMonthInfo, getMonthInfoForToday } = useDateUtils();

export const useCalendarStore = defineStore('calendar', () => {

    const initState = (): ICalendarState => {
        const savedState = get<IBaseCalendarState>(LOCAL_STORAGE_KEY);

        if (savedState) {
            const monthInfo = getMonthInfo(savedState.year, savedState.month);
            return {
                ...savedState,
                monthInfo,
            };
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const monthInfo = getMonthInfo(year, month);
        const { week, day } = monthInfo.todayIndices;

        return {
            layout: CalendarLayout.MONTH,
            year,
            month,
            week,
            day,
            monthInfo,
        }
    };

    const saveState = () => {
        const { year, month, week, day, layout } = state.value;
        console.log(`saveState, year = ${year}, month = ${month}, week = ${week}, day = ${day}, layout = ${layout}`);
        set<IBaseCalendarState>(LOCAL_STORAGE_KEY, { year, month, week, day, layout });
    };

    const updateMonthInfo = () => {
        state.value.monthInfo = getMonthInfo(state.value.year, state.value.month);

    };

    const state = ref<ICalendarState>(initState());

    const setLayout = (value: CalendarLayout) => {
        state.value.layout = value;

        if (value !== CalendarLayout.DAY) {
            saveState();
            return;
        }

        const { month, week, day } = state.value.monthInfo.todayIndices;

        if (month === -1 || week === -1 || day === -1) {
            const day = state.value.monthInfo.weeks[0].days.findIndex(day => day.month === state.value.month);
            setWeekAndDayIndices({ week: 0, day });
            return;
        }

        setWeekAndDayIndices({ week, day });
        saveState();
    };

    const setMonth = (index: number) => {
        state.value.month = index;
        updateMonthInfo();
        saveState();
    };

    const setWeek = (index: number) => {
        state.value.week = index;
        saveState();
    };

    const setDay = (indices: { week: number, day: number }) => {
        setWeekAndDayIndices(indices);
        setLayout(CalendarLayout.DAY);
        saveState();
    };

    const setInfoToToday = () => {
        state.value.monthInfo = getMonthInfoForToday();
        const { week, day } = state.value.monthInfo.todayIndices;
        state.value.week = week;
        state.value.day = day;
        saveState();
    };

    const setWeekAndDayIndices = (indices: { week: number, day: number }) => {
        const { week, day } = indices;

        state.value.week = week;
        state.value.day = day;

        saveState();
    };

    const incrementYear = () => {
        console.log('incrementYear');
    };

    const decrementYear = () => {
        console.log('decrementYear');
    };

    const updateMonth = () => {
        const monthOfCurrentDay = state.value.monthInfo.weeks[state.value.week].days[state.value.day].month;
        if (monthOfCurrentDay === state.value.month) {
            return;
        }
        // the month changed during an increment/decrement, request new month info
        const previousIndex = state.value.month;
        state.value.month = monthOfCurrentDay;
        updateMonthInfo();
        state.value.week = (previousIndex > monthOfCurrentDay) ? state.value.monthInfo.weeks.length - 1 : 0;
    };

    const incrementMonth = () => {
        state.value.week = 0;
        state.value.day = 0;
        // console.log(`incrementMonth`)
        if (state.value.month < MONTH_NAMES.length - 1) {
            // console.log(`\tthere are still month months in the year...`);
            state.value.month++;
            updateMonthInfo();
            saveState();
            return;
        }

        // console.log(`\treached last month, incrementing to next year`);
        state.value.year++;
        state.value.month = 0;
        saveState();
    };

    const decrementMonth = () => {
        state.value.day = 0;

        if (state.value.month > 0) {
            state.value.month--;
            updateMonthInfo();
            saveState();
            return;
        }

        state.value.year--;
        state.value.month = MONTH_NAMES.length - 1;
        updateMonthInfo();
        saveState();
    };

    const incrementWeek = () => {
        state.value.day = 0;

        if (state.value.week < state.value.monthInfo.weeks.length - 1) {
            state.value.week++;
            saveState();
            return;
        }
        // console.log(`week at last entry, going to increment month`);
        incrementMonth();
        saveState();
    };

    const decrementWeek = () => {
        state.value.day = 0;

        if (state.value.week > 0) {
            state.value.week--;
            saveState();
            return;
        }

        decrementMonth();
        state.value.week = state.value.monthInfo.weeks.length - 2;
        saveState();
    };

    const incrementDay = () => {
        if (state.value.day < 6) {
            state.value.day++;
            updateMonth();
            saveState();
            // console.log(`incremented day, day now = ${state.value.day}`);
            return;
        }

        if (state.value.week < state.value.monthInfo.weeks.length - 1) {
            state.value.week++;
            state.value.day = 0;
            // console.log(`incremented week, week & day indices now = ${state.value.week}, ${state.value.day}`);
            updateMonth();
            saveState();
            return;
        }

        state.value.month = (state.value.month < MONTH_NAMES.length - 1) ? state.value.month + 1 : 0;
        state.value.day = 0;
        state.value.week = 0;
        // console.log(`updated month, focused month now = ${state.value.month}`);

        if (state.value.month === 0) {
            state.value.year++;
            // console.log(`incremented year`);
        }

        updateMonthInfo();
        state.value.week = 0;
        state.value.day = 0;
        saveState();
    };

    const decrementDay = () => {
        if (state.value.day > 0) {
            state.value.day--;
            // console.log(`decremented day, day now = ${state.value.day}`);
            updateMonth();
            saveState();
            return;
        }

        if (state.value.week > 0) {
            state.value.week--;
            state.value.day = state.value.monthInfo.weeks[state.value.week].days.length - 1;
            // console.log(`decremented week, week & day indices now = ${state.value.week}, ${state.value.day}`);
            updateMonth();
            saveState();
            return;
        }

        state.value.month = (state.value.month > 0) ? state.value.month - 1 : MONTH_NAMES.length - 1;
        // console.log(`updated month, focused month now = ${state.value.month}`);

        if (state.value.month === MONTH_NAMES.length - 1) {
            state.value.year--;
            // console.log(`decremented year`);
        }

        // console.log(`week & day indices now = ${state.value.week}, ${state.value.day}`)
        updateMonthInfo();
        state.value.week = state.value.monthInfo.weeks.length - 1;
        state.value.day = state.value.monthInfo.weeks[state.value.week].days.length - 1;
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
        setDay,
        setInfoToToday,
        increment,
        decrement,
    };
});
