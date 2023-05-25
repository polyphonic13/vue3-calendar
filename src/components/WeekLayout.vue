<template>
    <div class="week" ref="weekEl">
        <div
            class="day_of_week_headers"
            ref="headerEl"
        >
            <DayOfWeekHeader
                v-for="(day, d) in props.weekInfo.days"
                :key="`${props.year}${day.month}${day.date}${d}`"
                :index="d"
                :year="props.year"
                :month="day.month"
                :day="day.date"
                :day-name="day.dayName"
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
        <div class="event_cards">
            <div
                v-for="(day, d) in DAYS_OF_WEEK"
                :key="d"
                class="day_selection_area"
                :class="{ 'day--selecting': isSelectingDays && selectedItems.includes(d) }"
                @mousedown="onDayMouseDown(d)"
                @mouseover="onDayMouseOver(d)"
                @mouseup="onDayMouseUp(d)"
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
                    :key="`${props.year}${props.month}${day.date}${d2}`"
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
    import { toRef, watch, computed, onMounted } from 'vue';

    import type { IEvent, INumberRange, IWeekInfo } from '@/interfaces';
    import { MouseSelectionType } from '@/enum/MouseSelectionType';

    import { TIMES_IN_DAY, DAYS_OF_WEEK } from '@/composables/use-date-utils';

    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';
    import { useEventStore } from '@/stores/events';

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

    const { getEventsForRange, viewEvent } = useEventStore();

    const selectedItems = toRef(state, 'selectedItems');
    const isSelecting = toRef(state, 'isSelecting');
    const isStartOnSecondHalf = toRef(state, 'isStartOnSecondHalf');
    const isEndOnFirstHalf = toRef(state, 'isEndOnFirstHalf');
    const currentInitiator = toRef(state, 'currentInitiator');
    const currentType = toRef(state, 'currentType');

    const emit = defineEmits([
        'addEvent',
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

    const getCardStyle = (event: IEvent, index: number) => {
        const width = (100 / 7) * ((event.dates.end - event.dates.start) + 1);
        const top = (index * 24) + 24;
        const leftMultiplier = (event.dates.start < props.weekInfo.days[0].date) ? 0 : (event.dates.start - props.weekInfo.days[0].date)
        const left = (100 / 7) * leftMultiplier;

        return `width: ${width}%; top: ${top}px; left: ${left}%`;
    };

    const addEvent = (times: INumberRange, dates: INumberRange) => {
        const { month, year } = props;

        const event: Partial<IEvent> = {
            times,
            dates,
            month,
            year,
        };

        emit('addEvent', event);

        onMouseUp();
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

    const onTimeMouseUp = (day: number) => {
        const times = getTimesFromItems();
        const date = props.weekInfo.days[day].date;

        addEvent(times, { start: date, end: date });
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

    const onDayMouseUp = (day: number) => {
        if (!isSelecting.value) {
            return;
        }

        const times = { start: 0, end: 0 };
        const dates = {
            start: props.weekInfo.days[selectedItems.value[0]].date,
            end: props.weekInfo.days[selectedItems.value[selectedItems.value.length - 1]].date,
        };
        addEvent(times, dates);
    };

    const weekEvents = (index: number) => {
        const days = props.weekInfo.days;
        return getEventsForRange(props.year, props.month, days[index].date, days[index].date);
    };

    const hourlyEvents = (index: number) => {
        return weekEvents(index).filter((event) => event.times.start !== 0 && event.times.end !== 0);
    };

    const dayEvents = computed(() => {
        const days = props.weekInfo.days;
        return getEventsForRange(props.year, props.month, days[0].date, days[days.length - 1].date).filter((event) => {
            if (event.times.start === 0 && event.times.end === 0) {
                return event;
            }
        });
    });

    const onDateClicked = (index: number) => {
        emit('dateClicked', { day: props.weekInfo.days[index].date, week: props.weekInfo.weekNumber });
    };

    const onEventClicked = (index: number) => {
        if (index > dayEvents.value.length) {
            console.warn(`ERROR: can not edit non-existent event with index ${index}`);
            return;
        }

        viewEvent(dayEvents.value[index]);
    };

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

        border-left: 1px solid $border-color01;
        border-bottom: 1px solid $border-color01;
    }

    .day_of_week_headers {
        width: 100%;
        min-height: 168px;
        display: flex;

    }


    .event_cards {
        // background-color: rgba(123, 234, 0, 0.24);

        width: 100%;
        min-height: 24px;
        height: 96px;

        top: 60px;

        display: flex;

        position: absolute;

        overflow: scroll
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
        display: flex;
        align-content: center;
        justify-content: flex-start;
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

        border-top: 1px solid $border-color01;
        box-sizing: border-mouseBox;

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
        box-sizing: border-mouseBox;

        display: flex;
        align-items: center;
        justify-content: flex-end;
        /* border: 1px solid #eee; */
        border-right: 1px solid $border-color01;
        /* border-bottom: 1px solid $border-color01; */

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
        box-sizing: border-mouseBox;

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
    }

</style>
