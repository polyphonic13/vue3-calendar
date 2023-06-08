import { ref, computed } from 'vue';

import { useEventStore } from '@/stores/events';

export function useComputedEventLists() {
    const { getEventsForRange, getIsFullDayEvent } = useEventStore();

    const startDate = ref<Date>();
    const endDate = ref<Date>();

    const setStartDate = (value: Date) => {
        startDate.value = value;
    };

    const setEndDate = (value: Date) => {
        endDate.value = value;
    };

    const weeklyEvents = computed(() => {
        if (!startDate.value || !endDate.value) {
            return [];
        }
        return getEventsForRange(startDate.value, endDate.value);
    });

    const dailyEvents = computed(() => {
        return weeklyEvents.value.filter((event) => getIsFullDayEvent(event));
    });

    const hourlyEvents = computed(() => {
        return weeklyEvents.value.filter((event) => !getIsFullDayEvent(event));
    });

    const getHourlyEventsForDay = (date: Date) => {
        return hourlyEvents.value.filter((event) => event.start.getDate() === date.getDate());
    };

    return {
        setStartDate,
        setEndDate,
        weeklyEvents,
        dailyEvents,
        hourlyEvents,
        getHourlyEventsForDay,
    };
}
