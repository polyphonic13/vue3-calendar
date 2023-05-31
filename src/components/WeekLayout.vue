<template>
    <div class="week" ref="weekEl">
        <div
            class="day_of_week_headers"
            ref="headerEl"
        >
            <DayOfWeekHeader
                v-for="(dayInfo, d) in props.weekInfo.days"
                :key="`${props.year}${dayInfo.month}${dayInfo.day}${d}`"
                :index="d"
                :year="props.year"
                :month="dayInfo.month"
                :day="dayInfo.day"
                :day-name="dayInfo.dayName"
                :is-selecting="isSelecting"
                :selected-items="selectedItems"
                :current-initiator="currentInitiator"
                :current-type="currentType"
                @day-on-mouse-down="onDayMouseDown"
                @day-on-mouse-over="onDayMouseOver"
                @day-on-mouse-up="onDayMouseUp"
                @date-clicked="onDateClicked"
            />
        </div>
        <div
            class="event_cards"
            :class="eventCardsClasses"
            :style="eventCardsStyle"
        >
            <div
                v-if="isEventCardsControlsVisible"
                class="event_cards__controls"
            >
                <button class="event_cards__controls__toggle_btn" @click="onToggleEventCardsExpandedClicked">
                    <svg v-if="isEventCardsExpanded" class="up_arrow" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>
                    <svg v-else class="down_arrow" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
                </button>
            </div>
            <div
                v-for="(day, d) in DAYS_OF_WEEK"
                :key="d"
                class="day_selection_area"
                :class="{ 'day--selecting': isSelectingDays && selectedItems.includes(d) }"
                @mousedown="onDayMouseDown(d)"
                @mouseover="onDayMouseOver(d)"
                @mouseup="onDayMouseUp()"
                @touchstart="onDayMouseDown(d)"
                @touchmove="onDayMouseOver(d)"
                @touchend="onDayMouseUp()"
            ></div>
            <button
                v-for="(event, e) in dayEvents"
                :key="event.id"
                class="event_card"
                :style="getCardStyle(event, e)"
                @click.stop="onEventClicked(e)"
            >
                <div class="event_card__title"><b>{{ event.title }}</b></div>

            </button>
        </div>
        <div
            class="day_container"
            ref="containerEl"
        >
            <div class="day_list">
                <DayOfWeek
                    v-for="(day, d2) in props.weekInfo.days"
                    :key="`${props.year}${props.month}${day.day}${d2}`"
                    :index="(d2 + 1)"
                    :day-name="`${(day.dayName) ? day.dayName : ''}`"
                    :is-include-time-label="(d2 === 0)"
                    :is-selecting="isSelecting"
                    :is-start-on-second-half="isStartOnSecondHalf"
                    :is-end-on-first-half="isEndOnFirstHalf"
                    :selected-items="selectedItems"
                    :current-initiator="currentInitiator"
                    :current-type="currentType"
                    :events="hourlyEvents(d2)"
                    @time-on-mouse-down="onTimeMouseDown"
                    @time-on-mouse-over="onTimeMouseOver"
                    @time-on-mouse-up="onTimeMouseUp(d2)"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    // external
    import {
        ref,
        toRef,
        watch,
        computed,
        onMounted,
    } from 'vue';

    // interfaces, types and enums
    import type {
        IEvent,
        INumberRange,
        IWeekInfo,
        IYearMonthDay,
    } from '@/interfaces';

    import { MouseSelectionType } from '@/enum/MouseSelectionType';

    // composables
    import {
        TIMES_IN_DAY,
        DAYS_OF_WEEK,
    } from '@/composables/use-date-utils';

    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';
    import { useCalculateEventCardRows } from '@/composables/use-calculate-event-card-rows';

    // stores
    import { useEventStore } from '@/stores/events';

    // components
    import DayOfWeekHeader from './DayOfWeekHeader.vue';
    import DayOfWeek from './DayOfWeek.vue';

    interface IWeekProps {
        year: number;
        month: number;
        index: number;
        weekInfo: IWeekInfo;
    }

    const props: IWeekProps = defineProps<IWeekProps>();

    const {
        state,
        initIndices,
        getTimesFromItems,
        onMouseDown,
        onMouseOver,
        onMouseUp,
    } = useMouseItemSelect();

    const {
        getEventsForRange,
        viewEvent,
        getDaysInEventCount,
    } = useEventStore();

    const { getRowsForEvents } = useCalculateEventCardRows();

    const selectedItems = toRef(state, 'selectedItems');
    const isSelecting = toRef(state, 'isSelecting');
    const isStartOnSecondHalf = toRef(state, 'isStartOnSecondHalf');
    const isEndOnFirstHalf = toRef(state, 'isEndOnFirstHalf');
    const currentInitiator = toRef(state, 'currentInitiator');
    const currentType = toRef(state, 'currentType');

    const emit = defineEmits([
        'createEvent',
        'dateClicked',
    ]);

    const initHourIndices = () => {
        initIndices<string>(TIMES_IN_DAY);
    };

    watch(() => props.weekInfo, () => {
        initHourIndices();
    });

    const isSelectingDays = computed(() => {
        return isSelecting && currentType.value === MouseSelectionType.DAILY;
    });

    const isEventCardsControlsVisible = computed(() => {
        return [...eventRows.value].sort((a, b) => b - a)[0] > 2;
    });

    const isCardsExpanded = ref(false);

    const isEventCardsExpanded = computed(() => {
        return isCardsExpanded.value;
    });

    const eventCardsClasses = computed(() => ({
        'event_cards--expanded': (isCardsExpanded.value)
    }));

    const eventCardsStyle = computed(() => {
        const sorted = [...eventRows.value].sort((a, b) => b - a);
        return (isEventCardsExpanded.value) ? `height: ${(((sorted[0] + 1) * 24) + 28)}px` : 'height: 96px';
    });

    const weekEvents = computed(() => {
        const days = props.weekInfo.days;
        return getEventsForRange(days[0], days[days.length - 1]);
    });

    const hourlyEvents = (index: number) => {
        const day = props.weekInfo.days[index].day;
        return weekEvents.value.filter((event) => {
            if(event.start.day === day && event.start.time !== 0 && event.end.time !== 0) {
                return event;
            }
        });
    };

    const dayEvents = computed(() => {
        return weekEvents.value.filter((event) => event.start.time === 0 && event.end.time === 0);
    });

    const eventRows = computed(() => {
        return getRowsForEvents(dayEvents.value, props.weekInfo.days);
    });

    const getCardStyle = (event: IEvent, index: number) => {
        const daysInEvent = getDaysInEventCount(event);
        const width = (100 / 7) * daysInEvent;
        // add extra 24 to include white space at top for new event creation
        const top = ((eventRows.value[index]) * 24) + 24;
        const leftMultiplier = props.weekInfo.days.findIndex((dayInfo) => dayInfo.day === event.start.day);
        const left = (100 / 7) * leftMultiplier;

        return `width: ${width}%; top: ${top}px; left: ${left}%`;
    };

    const emitCreateEvent = (times: INumberRange, startYMD: IYearMonthDay, endYMD: IYearMonthDay) => {
        const seed = {
            start: {
                ...startYMD,
                time: times.start,
            },
            end: {
                ...endYMD,
                time: times.end,
            },
        };

        emit('createEvent', seed);
    };

    const onTimeMouseDown = (day: number, hour: number, isSecondHalf?: boolean) => {
        onMouseDown(hour, day, MouseSelectionType.HOURLY, isSecondHalf);
    };

    const onTimeMouseOver = (hour: number, isSecondHalf?: boolean) => {
        if (!isSelecting) {
            return;
        }
        onMouseOver(hour, isSecondHalf)
    };

    const onTimeMouseUp = (dayIndex: number) => {
        const times = getTimesFromItems();

        const { day, year, month } = props.weekInfo.days[dayIndex];

        const startYMD = {
            year,
            month,
            day,
        };

        const endYMD = {
            year,
            month,
            day,
        };

        emitCreateEvent(times, startYMD, endYMD);
        onMouseUp();
    };

    const onDayMouseDown = (day: number) => {
        onMouseDown(day, day, MouseSelectionType.DAILY);
    }

    const onDayMouseOver = (day: number) => {
        if (!isSelecting.value) {
            return;
        }

        onMouseOver(day);
    };

    const onDayMouseUp = () => {
        if (!isSelecting.value) {
            return;
        }

        const times = { start: 0, end: 0 };

        const startDay = props.weekInfo.days[selectedItems.value[0]];
        const endDay = props.weekInfo.days[selectedItems.value[selectedItems.value.length - 1]];

        emitCreateEvent(times, startDay, endDay);
        onMouseUp();
    };

    const onDateClicked = (index: number) => {
        emit('dateClicked', { day: props.weekInfo.days[index].day, week: props.weekInfo.weekNumber });
    };

    const onEventClicked = (index: number) => {
        if (index > dayEvents.value.length) {
            console.warn(`ERROR: can not edit non-existent event with index ${index}`);
            return;
        }

        viewEvent(dayEvents.value[index]);
    };

    const onToggleEventCardsExpandedClicked = () => {
        isCardsExpanded.value = !isCardsExpanded.value;
    }

    onMounted(() => {
        initHourIndices();
    });
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';
    @import '../styles/mixins.scss';

    .week {
        height: calc(100% - 98px);

        flex: 1;
        display: flex;
        flex-direction: column;

        position: relative;

        border-left: 1px solid $borderColor01;
        border-bottom: 1px solid $borderColor01;
    }

    .day_of_week_headers {
        width: 100%;
        height: 64px;
        display: flex;

        box-sizing: border-box;
        border-right: 1px solid $borderColor01;
    }

    .event_cards {
        @include event_cards;

        width: 100%;

        box-sizing: border-box;

        display: flex;

        position: relative;

        border-right: 1px solid $borderColor01;
    }

    .event_cards--expanded {
        @include event_cards--expanded;
    }

    .event_cards__controls {
        bottom: 4px;
        left: 4px;
        position: absolute;
    }

    .event_cards__controls__toggle_btn {
        @include circle_button;

        z-index: 1000;
    }

    .event_cards__controls__toggle_btn:hover {
        @include circle_button--hover;
    }

    .event_card {
        @include event_card;
        @include event_card--rounded;

        height: 24px;

        left: 0;
        position: absolute;
    }

    .event_card:hover {
        @include event_card--hover;
    }

    .event_card--rounded {
        @include event_card--rounded;
    }

    .event_card--left {
        @include event_card--rounded_left;
    }

    .event_card--right {
        @include event_card--rounded_right;
    }

    .event_card__title {
        @include event_card__title;

        padding: 2px 0 0 2px;
    }

    .day_selection_area {
        width: calc(100% / 7);
        height: 100%;

    }

    .day--selecting {
        @include selected_item;
    }

    .day_container {
        width: 100%;

        flex: 1;
        display: flex;
        flex-direction: column;

        border-top: 1px solid $borderColor01;
        box-sizing: border-box;

        overflow-y: scroll;

    }

    .time_column {
        max-width: 64px;

        display: flex;
        flex-direction: column;

        text-align: right;
        user-select: none;
    }

    .week_number {

        font-size: 1em;
    }

    .week_number > span {
        transform: rotate(-90deg);
    }

    .time_slot {
        min-height: 48px;
        max-height: 48px;

        font-size: 0.85em;
    }

    .week_number, .time_slot {
        padding: 4px;
        box-sizing: border-box;

        display: flex;
        align-items: center;
        justify-content: flex-end;
        /* border: 1px solid #eee; */
        border-right: 1px solid $borderColor01;
        /* border-bottom: 1px solid $borderColor01; */

        color: $greyscale01;
    }

    .day_list {
        flex: 1;
        display: flex;
    }

    .info {
        width: 100%;
        max-height: 32px;

        padding: 8px;
        box-sizing: border-box;

        background-color: #eef;

        flex: 1;
        display: flex;
        align-content: center;
        justify-content: flex-start;
    }

    @media screen and (max-width: 400px) {
        .week {
            height: calc(100% - 144px);
        }

        .event_card {
            @include event_card--mobile;
        }
    }

</style>
