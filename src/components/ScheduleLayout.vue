<template>
    <div class="schedule_layout">
        <div class="schedule_layout__days">
            <div
                v-for="(date, d) in days"
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
                <div class="schedule_layout__day__events"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, computed, watch, ref } from 'vue';

    import { SHORT_MONTH_NAMES, SHORT_DAY_NAMES, useDateUtils } from '@/composables/use-date-utils';

    import { useCalendarByMonth } from '@/composables/use-calendar-by-month';

    import { useEventStore } from '@/stores/events';
    import { useCalendarStore } from '@/stores/calendar';

    interface IScheduleLayoutProps {
        year: number;
        month: number;
    }

    const props = defineProps<IScheduleLayoutProps>();

    const {
        weeklyDates,
        currentMonth,
        setMonthAndYear,
    } = useCalendarByMonth();

    const { getEventsForRange } = useEventStore();

    const { getIsDateToday } = useDateUtils();

    const { getWeekForDate } = useCalendarStore();

    const emit = defineEmits(['createEvent', 'dateClicked']);

    watch(() => props.month, () => {
        scrollToToday();
        setMonthAndYear(props.month, props.year);
    });

    const getTodayIndex = computed(() => {
        const today = new Date();
        return days.value.findIndex(date => date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate());
    });

    const days = computed(() => {
        return currentMonth.value.filter(date => date.getMonth() === props.month);
    })

    const events = computed(() => {
        return getEventsForRange(currentMonth.value[0], currentMonth.value[weeklyDates.value.length - 1]);
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

        border-left: 1px solid $borderColor01;
        border-top: 1px solid $borderColor01;

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
    }
</style>
