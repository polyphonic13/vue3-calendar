import { computed } from 'vue';

import { useEventStore } from '@/stores/events';

export function useComputedEventLists(startDate: Date, endDate: Date) {
    const { getEventsForRange, getIsFullDayEvent } = useEventStore();

    const weeklyEvents = computed(() => {
        return getEventsForRange(startDate, endDate);
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
        weeklyEvents,
        dailyEvents,
        hourlyEvents,
        getHourlyEventsForDay,
    };
}
