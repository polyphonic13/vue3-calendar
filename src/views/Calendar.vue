<template>
    <div
        v-if="calendarState"
        class="calendar"
        @keydown.stop="onKeyDown"
    >
        <CalendarHeader
            @prev-clicked="onPrevClicked"
            @next-clicked="onNextClicked"
            @today-clicked="onTodayClicked"
            @layout-changed="onLayoutChanged"
        />
        <MonthLayout
            v-if="calendarState.layout === CalendarLayout.MONTH"
            :year="calendarState.year"
            :month="calendarState.month"
            @date-clicked="onDateClicked"
            @create-event="onCreateEvent"
        />
        <WeekLayout
            v-if="calendarState.layout === CalendarLayout.WEEK"
            :year="calendarState.year"
            :month="calendarState.month"
            :index="calendarState.week"
            :week-info="calendarState.yearData[calendarState.year].weeks[calendarState.week]"
            @date-clicked="onDateClicked"
            @create-event="onCreateEvent"
        />
        <DayLayout
            v-if="calendarState.layout === CalendarLayout.DAY"
            :date="calendarState.yearData[calendarState.year].weeks[calendarState.week][calendarState.dayOfWeek]"
            @create-event="onCreateEvent"
        />
        <ScheduleLayout
            v-if="calendarState.layout === CalendarLayout.SCHEDULE"
            :year="calendarState.year"
            :month="calendarState.month"
            @date-clicked="onDateClicked"
            @create-event="onCreateEvent"
        ></ScheduleLayout>
        <EventModal
            v-if="isViewingEvent"
            :event="focusedEvent"
            :is-new="isNewEvent"
            @on-close="onEventModalClose"
        />
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, onUnmounted } from 'vue';
    import { storeToRefs } from 'pinia';

    import { CalendarLayout } from '../enum/CalendarLayout';

    import { useCalendarStore } from '@/stores/calendar';
    import { useEventStore } from '@/stores/events';

    import type { IEvent } from '../interfaces';

    import { useUIStore } from '@/stores/ui';

    import MonthLayout from '@/components/MonthLayout.vue';
    import WeekLayout from '@/components/WeekLayout.vue';
    import DayLayout from '@/components/DayLayout.vue';
    import CalendarHeader from '@/components/CalendarHeader.vue';
    import ScheduleLayout from '@/components/ScheduleLayout.vue';
    import EventModal from '@/components/events/EventModal.vue';

    const calendarStore = useCalendarStore();
    const { calendarState } = storeToRefs(calendarStore);

    const uiStore = useUIStore();
    const { uiState } = storeToRefs(uiStore);

    const {
        setLayout,
        setInfoToToday,
        setDay,
        increment,
        decrement,
    } = calendarStore;

    const eventStore = useEventStore();

    const {
        createEvent,
        cancelEditEvent,
        deleteEvent,
        getFocusedEvent,
    } = eventStore;

    let isNewEvent = false;

    const isViewingEvent = computed(() => {
        return uiState.value.isViewingEvent;
    });

    const focusedEvent = computed(() => {
        return getFocusedEvent();
    });

    const onPrevClicked = () => {
        decrement();
    };

    const onNextClicked = () => {
        increment();
    };

    const onTodayClicked = () => {
        setInfoToToday();
    };

    const onLayoutChanged = (type: CalendarLayout) => {
        setLayout(type);
    };

    const onDateClicked = (indices: { week: number, day: number }) => {
        setDay(indices);
    };

    const onCreateEvent = (event: Partial<IEvent>) => {
        resetEventEditing();
        createEvent(event);
        isNewEvent = true;
        uiState.value.isViewingEvent = true;
    };

    const handleEscapeClicked = () => {
        if (!isViewingEvent) {
            return;
        }
        resetEventEditing();
    };

    const handleDeleteClicked = () => {
        if (!isViewingEvent) {
            return;
        }

        if (isNewEvent) {
            resetEventEditing();
            return;
        }

        if (!focusedEvent) {
            return;
        }

        deleteEvent();
    };

    const LAYOUT_TYPES_FOR_KEY = new Map<string, CalendarLayout>(
        [
            ['m', CalendarLayout.MONTH],
            ['w', CalendarLayout.WEEK],
            ['d', CalendarLayout.DAY],
            ['s', CalendarLayout.SCHEDULE],
        ],
    );

    const onKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        if (key === 'escape') {
            handleEscapeClicked();
            return;
        }

        if (key === 'delete' || key === 'backspace') {
            handleDeleteClicked();
            return;
        }

        const type: CalendarLayout | undefined = LAYOUT_TYPES_FOR_KEY.get(key);

        if (!type) {
            return;
        }

        setLayout(type);
    };

    const onEventModalClose = () => {
        resetEventEditing();
    };

    const resetEventEditing = () => {
        uiState.value.isViewingEvent = false;
        isNewEvent = false;
        cancelEditEvent();
    };

    onMounted(() => {
        window.addEventListener('keydown', onKeyDown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', onKeyDown);
    });
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';
    @import '../styles/mixins.scss';

    .calendar {
        height: 100%;
        flex: 1;

        padding: 16px;
        box-sizing: border-box;

        display: inline-flex;
        flex-direction: column;

        overflow: hidden;
    }

    @media screen and (max-width: 400px) {
        .calendar {
            padding: 8px;
            width: 100%;
        }
    }
</style>
