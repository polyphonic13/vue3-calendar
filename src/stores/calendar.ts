import { ref } from 'vue';
import { defineStore } from 'pinia';

import { CalendarLayout } from '@/enum/CalendarLayout';

import { useLocalStorage } from '@/composables/use-local-storage';
import { useDateUtils } from '@/composables/use-date-utils';

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

    const state = ref<ICalendarState>(initState());

    const setLayout = (value: CalendarLayout) => {
        state.value.layout = value;
        saveState();
    };

    const setMonth = (index: number) => {
        state.value.month = index;
        state.value.monthInfo = getMonthInfo(state.value.year, index);
        saveState();
    };

    const setWeek = (index: number) => {
        state.value.week = index;
        saveState();
    };

    const setDay = (index: number) => {
        state.value.day = index;
        saveState();
    };

    const setInfoToToday = () => {
        state.value.monthInfo = getMonthInfoForToday();
        const { week, day } = state.value.monthInfo.todayIndices;
        state.value.week = week;
        state.value.day = day;
        saveState();
    };

    const saveState = () => {
        const { year, month, week, day, layout } = state.value;
        console.log(`saveState, year = ${year}, month = ${month}, week = ${week}, day = ${day}, layout = ${layout}`);
        set<IBaseCalendarState>(LOCAL_STORAGE_KEY, { year, month, week, day, layout });
    };

    return {
        state,
        setLayout,
        setMonth,
        setWeek,
        setDay,
        setInfoToToday,
    };
});
