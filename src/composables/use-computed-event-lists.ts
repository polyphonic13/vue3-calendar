import { ref, computed } from 'vue';

import { useEventStore } from '@/stores/events';
import type { IEvent } from '@/interfaces';

export function useComputedEventLists() {
    const { getEventsForRange, getIsFullDayEvent, getIsFullOrMultiDayEvent } = useEventStore();

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
        return getEventsForRange(startDate.value, endDate.value, true);
    });

    const dailyEvents = computed(() => {
        return weeklyEvents.value.filter((event) => getIsFullOrMultiDayEvent(event));
    });

    const hourlyEvents = computed(() => {
        return weeklyEvents.value.filter((event) => !getIsFullOrMultiDayEvent(event));
    });

    const getHourlyEventsForDay = (date: Date) => {
        return hourlyEvents.value.filter((event) => event.start.getDate() === date.getDate());
    };

    const getHourlyEventsForDate = (date: Date, events: IEvent[]) => {
        return events.filter((event) => event.start.getDate() === date.getDate());
    };

    return {
        setStartDate,
        setEndDate,
        weeklyEvents,
        dailyEvents,
        hourlyEvents,
        getHourlyEventsForDay,
        getHourlyEventsForDate,
    };
}
