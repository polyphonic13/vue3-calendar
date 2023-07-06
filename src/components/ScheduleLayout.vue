<template>
    <div class="schedule_layout">
        <div class="schedule_layout__days">
            <div
                v-for="(date, d) in daysWithEvents"
                :key="d"
                class="schedule_layout__day"
                :id="`schedule-layout-day-${d}`"
            >
                <div class="schedule_layout__day__date">
                    <button
                        class="day_btn"
                        :class="{ 'day_btn--current': getIsDateToday(date) }"
                        @click.stop="onDateClicked(d)"
                        @mousedown.stop=""
                        @touchstart.stop=""
                    >{{ date.getDate() }}</button>
                    <span class="date_month_and_day" :class="{ 'date_month_and_day--current': getIsDateToday(date) }">
                        {{ SHORT_MONTH_NAMES[date.getMonth()].toUpperCase() }}, {{ SHORT_DAY_NAMES[date.getDay()] }}
                    </span>
                </div>
                <div class="schedule_layout__day__events">
                    <div
                        v-for="(event, e) in filteredEvents[d]"
                        :key="`${d}${e}`"
                        class="schedule_layout__day__event"
                    >
                        <span class="event_dot" :class="{ [`${event.calendarName}_event_calendar`]: true }"></span>
                        <div class="schedule_layout__day__event__date_time">{{ getEventDateTime(event) }}</div>
                        <button
                            class="schedule_layout__day__event__link"
                            @click="onEventClicked(d, e)"
                        >{{ event.title }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {
        onMounted,
        computed,
        watch,
    } from 'vue';

    import {
        SHORT_MONTH_NAMES,
        SHORT_DAY_NAMES,
        useDateUtils,
     } from '@/composables/use-date-utils';

    import { useCalendarByMonth } from '@/composables/use-calendar-by-month';
    import { useViewEvent } from '@/composables/use-view-event';

    import { useEventStore } from '@/stores/events';
    import { useCalendarStore } from '@/stores/calendar';
    import type { IEvent } from '@/interfaces';

    interface IScheduleLayoutProps {
        year: number;
        month: number;
    }

    const props = defineProps<IScheduleLayoutProps>();

    const {
        currentMonth,
        setMonthAndYear,
    } = useCalendarByMonth();

    const { getEventsForDate, getIsFullDayEvent } = useEventStore();

    const { getIsDateToday, convertDateToHHMM } = useDateUtils();

    const { getWeekForDate } = useCalendarStore();

    const { viewEvent } = useViewEvent();

    const emit = defineEmits(['createEvent', 'dateClicked']);

    watch(() => props.month, () => {
        scrollToToday();
        setMonthAndYear(props.month, props.year);
    });

    const getTodayIndex = computed(() => {
        const today = new Date();
        return daysWithEvents.value.findIndex(date => date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate());
    });

    const currentMonthOnlyDays = computed(() => {
        return currentMonth.value.filter(date => date.getMonth() === props.month);
    });

    const daysWithEvents = computed(() => {
        return currentMonthOnlyDays.value.filter((_, d) => events.value[d].length > 0);
    });

    const events = computed(() => {
        return currentMonthOnlyDays.value.map(date => getEventsForDate(date));
    });

    const filteredEvents = computed(() => {
        return events.value.filter(day => day.length > 0);
    });

    const scrollElIntoView = (id: string) => {
        const el = document.getElementById(id);
        if (!el) {
            return;
        }
        el.scrollIntoView({block: 'start', inline: 'nearest' });
    };

    const scrollToToday = () => {
        if (getTodayIndex.value === -1) {
            scrollElIntoView('schedule-layout-day-0');
            return;
        }

        scrollElIntoView(`schedule-layout-day-${getTodayIndex.value}`);
    };

    const getEventDateTime = (event: IEvent) => {
        if (getIsFullDayEvent(event)) {
            return 'All Day';
        }

        return `${convertDateToHHMM(event.start, true)} - ${convertDateToHHMM(event.end, true)}`;
    };

    const onDateClicked = (index: number) => {
        if (!currentMonth.value) {
            console.warn(`WARNING: no month info present`);
            return;
        }

        const target = currentMonth.value[index];
        const day = target.getDate();
        const week = getWeekForDate(target);

        emit('dateClicked', { day, week });
    };

    const onEventClicked = (day: number, event: number) => {
        viewEvent(filteredEvents.value[day][event]);
    };

    onMounted(() => {
        scrollToToday();
        setMonthAndYear(props.month, props.year);
    });
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';
    @import '../styles/mixins.scss';

    .schedule_layout {
        width: 100%;

        flex: 1;

        border: 1px solid $borderColor01;

        box-sizing: border-box;

        overflow-x: hidden;
        overflow-y: scroll;

    }

    .schedule_layout__days {
        width: 100%;

        display: flex;
        flex-direction: column;
    }

    .schedule_layout__day {
        width: 100%;
        min-height: 64px;

        border-bottom: 1px solid $borderColor01;
        box-sizing: border-box;

        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .schedule_layout__day__date {
        width: 162px;
        height: 100%;

        padding: 8px;

        box-sizing: border-box;

        display: flex;
        align-items: center;
        justify-content: flex-start;

        > * {
            padding: 8px;
        }
    }


    .date_month_and_day {
        width: 96px;
    }

    .day_btn {
        @include circle_button;

        font-size: 1.5em;
        line-height: 1em;
    }

    .day_btn:hover {
        @include circle_button--hover;
    }

    .day_btn--current {
        @include circle_button--current;
    }

    .day_btn--current:hover {
        @include circle_button--current--hover;
    }

    .date_month_and_day--current {
        color: $highlightedColorPrimary;
    }

    .schedule_layout__day__events {
        flex: 1;

        display: flex;
        flex-direction: column;

        align-items: flex-start
    }

    .schedule_layout__day__event {
        display: flex;
        align-items: center;

        > * {
            padding: 0 4px;
        }
    }

    .event_dot {
        @include event_dot;
    }

    .schedule_layout__day__event__date_time {
        min-width: 128px;
        margin-right: 16px;

        user-select: none;
    }


    .schedule_layout__day__event__link {
        @include link_btn;

        padding: 8px;

        font-weight: 500;
    }

    @media screen and (max-width: 400px) {
        .schedule_layout__day__date {
            width: 128px;
        }

        .schedule_layout__day__event__date_time {
            display: none;
        }
    }
</style>
