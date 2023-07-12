<template>
    <div class="calendar_header">
        <div class="calendar_header__content">
            <span class="title">{{ headerTitle }}</span>
            <span v-if="calendarState.layout === CalendarLayout.WEEK">WEEK {{ calendarState.week + 1 }}</span>
        </div>
        <div class="calendar_header__calendar_names">
            <button
                v-for="(calendar, n) in calendars"
                :key="n"
                class="control_btn calendar_header__calendar_name__btn"
                :class="{ [`${calendar.name}_event_calendar`]: true, disabled: !calendar.isActive }"
                @click="onCalendarButtonClicked(n)"
            >{{ calendar.name }}</button>
        </div>
        <div class="calendar_header__controls">
            <button class="control__btn arrow_btn" @click="$emit('prevClicked')">
                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
            </button>
            <button class="control__btn arrow_btn" @click="$emit('nextClicked')">
                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
            </button>
            <button class="control__btn today_btn" @click="$emit('todayClicked')">TODAY</button>
            <LayoutSelector :layout="calendarState.layout" @layout-btn-clicked="onLayoutButtonClicked" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { storeToRefs } from 'pinia';

    import { useCalendarStore } from '@/stores/calendar';
    import { useEventStore } from '@/stores/events';

    import { CalendarLayout } from '../enum/CalendarLayout';

    import { MONTH_NAMES } from '@/composables/use-date-utils';

    import LayoutSelector from '@/components/fields/LayoutSelector.vue';

    const emit = defineEmits([
        'prevClicked',
        'nextClicked',
        'todayClicked',
        'layoutChanged',
    ]);

    const calendarStore = useCalendarStore();
    const { calendarState } = storeToRefs(calendarStore);

    const { setCalendarActive, getEventCalendars } = useEventStore();

    const calendars = computed(() => {
        return getEventCalendars();
    });

    const headerTitle = computed(() => {
        if (!calendarState) {
            return '';
        }

        if (calendarState.value.layout !== CalendarLayout.WEEK) {
            return `${MONTH_NAMES[calendarState.value.month]} ${calendarState.value.year}`;
        }

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

    const onCalendarButtonClicked = (index: number) => {
        const calendar = calendars.value[index];
        setCalendarActive(calendar.name, !calendar.isActive);
    };

    const onLayoutButtonClicked = (type: CalendarLayout) => {
        emit('layoutChanged', type);
    }
</script>

<style scoped lang="scss">
    @import '../styles/variables.scss';
    @import '../styles/mixins.scss';

    .calendar_header {
        width: 100%;
        padding-bottom: 16px;

        text-align: center;
        box-sizing: border-box;

        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .calendar_header__content {
        margin: 0 8px 0 8px;

        display: flex;
        align-items: center;
    }

    .calendar_header__content > * {
        padding: 8px;
    }

    .title,
    .year {
        font-size: 2em;
    }

    .calendar_header__calendar_names {
        height: 100%;

        margin-right: 8px;

        flex-grow: 1;
        flex-basis: 30%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    .calendar_header__calendar_name__btn {
        @include calendar_name__btn;
    }

    .calendar_header__calendar_name__btn.disabled {
        background-color: transparent;
        color: $inactiveColor01;
    }

    .calendar_header__calendar_name__btn:hover {
        @include control__btn--hover;
    }

    .calendar_header__controls {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .control__btn {
        @include control__btn;
    }

    .control__btn:hover {
        @include control__btn--hover;
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

    .today_btn,
    .layout_btn {
        padding: 8px;
    }

    .control__btn:hover:disabled {
        background-color: transparent;
    }

    @media screen and (max-width: 400px) {
        .header {
            padding: 8px;
            flex-direction: column;
        }

        .title {
            padding: 8px 4px;
            font-size: 0.9em;
        }

        .header__content {
            margin: 0 8px 8px 8px;
        }

        .controls {
            margin-bottom: 8px;
        }

        .calendar_header__calendar_names {
            display: none;
        }

    }
</style>
