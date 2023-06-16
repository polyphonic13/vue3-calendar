import { computed, ref } from 'vue'

import { useCalendarStore } from '@/stores/calendar';

export function useCalendarByMonth() {
    const year = ref(0);
    const month = ref(0);

    const { getWeeksForMonth, getCurrentMonth } = useCalendarStore();

    const setMonthAndYear = (m: number, y: number) => {
        month.value = m;
        year.value = y;
    };

    const weeklyDates = computed(() => {
        return getWeeksForMonth(month.value, year.value);
    });

    const currentMonth = computed(() => {
        return getCurrentMonth();
    });

    return {
        setMonthAndYear,
        weeklyDates,
        currentMonth,
    };
}
