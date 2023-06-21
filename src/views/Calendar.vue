<template>
    <div
        v-if="calendarState"
        class="calendar"
        @keydown.stop="onKeyDown"
    >
        <div class="header">
            <div class="header__content">
                <span class="title">{{ headerTitle }}</span>
                <span v-if="calendarState.layout === CalendarLayout.WEEK">WEEK {{ calendarState.week + 1 }}</span>
            </div>
            <div class="controls">
                <button class="control__btn arrow_btn" @click="onPrevClicked">
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </button>
                <button class="control__btn arrow_btn" @click="onNextClicked">
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>
                <button class="control__btn today_btn" @click="onTodayClicked">TODAY</button>
                <LayoutSelector
                    :layout="calendarState.layout"
                    @layout-btn-clicked="onLayoutBtnClicked"
                />
            </div>
        </div>

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

    import { MONTH_NAMES } from '@/composables/use-date-utils';

    import { CalendarLayout } from '../enum/CalendarLayout';

    import { useCalendarStore } from '@/stores/calendar';
    import { useEventStore } from '@/stores/events';

    import type { IEvent } from '../interfaces';

    import { useUIStore } from '@/stores/ui';

    import MonthLayout from '@/components/MonthLayout.vue';
    import WeekLayout from '@/components/WeekLayout.vue';
    import DayLayout from '@/components/DayLayout.vue';
    import LayoutSelector from '@/components/LayoutSelector.vue';
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

    const headerTitle = computed(() => {
        if (!calendarState) {
            return '';
        }

        if (calendarState.value.layout !== CalendarLayout.WEEK) {
            return `${MONTH_NAMES[calendarState.value.month]} ${calendarState.value.year}`;
        }
        // console.log(`updating headerTitle`);
        const monthIndices: number[] = [];
        let month;

        calendarState.value.yearData[calendarState.value.year].weeks[calendarState.value.week].forEach((day) => {
            month = day.getMonth();
            if (!monthIndices.includes(month)) {
                monthIndices.push(month);
            }
        });

        const months = monthIndices.map((index) => MONTH_NAMES[index]);

        return `${months.join(' - ')} ${calendarState.value.year}`;
    });

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

    const onLayoutBtnClicked = (type: CalendarLayout) => {
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

        display: flex;
        flex-direction: column;

        overflow: hidden;
    }

    .header {
        width: 100%;
        padding-bottom: 16px;

        text-align: center;
        box-sizing: border-box;

        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .header__content {
        margin: 0 8px 0 8px;

        display: flex;
        align-items: center;
    }

    .header__content > * {
        padding: 8px;
    }

    .title, .year {
        font-size: 2em;
    }

    .controls {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .day_names {
        background-color: #fff;
        width: 100%;
        height: 28px;
        box-sizing: border-box;

        display: flex;
    }

    .day_name {
        text-align: center;
        width: calc(100%/7);
        height: 100%;

        box-sizing: border-box;
        border-right: 1px solid $borderColor01;
        border-bottom: 1px solid $borderColor01;

        display:flex;
        align-items: center;
        justify-content: center;
    }

    .control__btn {
        @include control__btn;
    }

    .arrow_btn {
        border: 1px solid $greyscale02;
        border-radius: 50%;
        max-width: 34px;
    }

    .today_btn {
        margin-left: 8px;
        border: 1px solid #ccc;
    }

    .today_btn, .layout_btn {
        padding: 8px;
    }

    .control__btn:hover {
        background-color: rgba(238, 238, 238, 0.75);
    }

    .control__btn:hover:disabled {
        background-color: transparent;
    }

    @media screen and (max-width: 400px) {
        .calendar {
            padding: 8px;
            width: 100%;
        }

        .header {
            padding: 8px;
            flex-direction: column;
        }

        .header__content {
            margin: 0 8px 8px 8px;
        }

        .controls {
            margin-bottom: 8px;
        }
    }
</style>
