import { ref } from 'vue';
import { defineStore } from 'pinia';

import { CalendarLayout } from '@/enum/CalendarLayout';

import { useLocalStorage } from '@/composables/use-local-storage';
import { useDateUtils } from '@/composables/use-date-utils';

import type { ICalendarState } from '@/interfaces';

const LOCAL_STORAGE_KEY = 'calendarAppCalendarData';

const { get, set } = useLocalStorage();
const { getMonthInfo, getMonthInfoForToday } = useDateUtils();

export const useCalendarStore = defineStore('calendar', () => {

    const savedLayout = get<CalendarLayout>(LOCAL_STORAGE_KEY);
    const layout = (savedLayout) ? savedLayout : CalendarLayout.MONTH;

    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const monthInfo = getMonthInfo(year, monthIndex);
    const { week, day } = monthInfo.todayIndices;

    const state = ref<ICalendarState>({
        layout,
        year,
        monthIndex,
        weekIndex: week,
        dayIndex: day,
        monthInfo,
    });

    const setLayout = (layout: CalendarLayout) => {
        state.value.layout = layout;
        set(LOCAL_STORAGE_KEY, state.value.layout);
    };

    const setMonthIndex = (index: number) => {
        state.value.monthIndex = index;
        state.value.monthInfo = getMonthInfo(state.value.year, index);
    };

    const setWeekIndex = (index: number) => {
        state.value.weekIndex = index;
    };

    const setDayIndex = (index: number) => {
        state.value.dayIndex = index;
    };

    const setInfoToToday = () => {
        state.value.monthInfo = getMonthInfoForToday();
        const { week, day } = monthInfo.todayIndices;
        state.value.weekIndex = week;
        state.value.dayIndex = day;
    };

    console.log(`useCalendarStore, state = `, state);

    return {
        state,
        setLayout,
        setMonthIndex,
        setWeekIndex,
        setDayIndex,
        setInfoToToday,
    };
});
