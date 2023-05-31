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
        <div class="event_cards">
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
    import { toRef, watch, computed, onMounted } from 'vue';

    import type {
        IEvent,
        INumberRange,
        IWeekInfo,
        IYearMonthDay,
    } from '@/interfaces';

    import { MouseSelectionType } from '@/enum/MouseSelectionType';

    import { TIMES_IN_DAY, DAYS_OF_WEEK, useDateUtils } from '@/composables/use-date-utils';

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

    const {
        getEventsForRange,
        viewEvent,
        getDaysInEventCount,
    } = useEventStore();

    const { getAreDatesWithinRange } = useDateUtils();

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

    interface IEventPositionMeta {
        duration: number;
        startDay: number;
    }

    const populateGridForEvent = (grid: boolean[][], event: IEvent, dayIndex: number, rows: number[]) => {
        const duration = event.dayCount;
        let isFree: boolean;
        console.log(`\tdayIndex = ${dayIndex}, duration = ${duration}`);
        for (let i = 0; i < grid.length; i++) {
            isFree = true;
            for (let j = dayIndex; j < (duration + dayIndex); j++) {
                console.log(`\tgrid[ ${i} ][ ${j} ] = ${grid[i][j]}`);
                if (grid[i][j]) {
                    console.log(`\t\t${i} is unavailable`);
                    isFree = false;
                    break;
                }
            }

            if (isFree) {
                console.log(`\tfound free space at ${i}`);
                for (let k = dayIndex; k < (duration + dayIndex); k++) {
                    console.log(`\t\tpopulating [ ${i} ][ ${k} ] with true`);
                    grid[i][k] = true;
                }
                rows.push(i);
                break;
            }
        }

        return grid;
    };

    const eventPositionMeta = computed(() => {
        const rows: number[] = [];

        let grid: boolean[][] = [];

        for (let i = 0; i < dayEvents.value.length; i++) {
            grid[i] = [];
            for (let j = 0; j < props.weekInfo.days.length; j++) {
                grid[i][j] = false;
            }
        }

        console.log(`grid = `, grid);

        dayEvents.value.forEach((event) => {
            console.log(`event[ ${event.id} ] duration = ${event.dayCount}`);

            props.weekInfo.days.forEach((dayInfo, d) => {
                if (dayInfo.day === event.start.day) {
                    grid = populateGridForEvent(grid, event, d, rows);
                    // console.log(`\tgrid now = ${JSON.stringify(grid)}`);
                }
            });
        });

        console.log(`rows = ${rows}`);
        return rows;
    });

    const getCardStyle = (event: IEvent, index: number) => {
        const daysInEvent = getDaysInEventCount(event);
        const width = (100 / 7) * daysInEvent;
        // const top = (index * 24) + 24;
        const top = (eventPositionMeta.value[index]) * 24;
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

    onMounted(() => {
        console.log(`WeekLayout/onMounted, row per day = ${eventPositionMeta.value}`);
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
        background-color: rgba(123, 234, 0, 0.24);

        width: 100%;
        min-height: 24px;
        height: 108px;

        top: 60px;

        display: flex;

        position: absolute;

        overflow: scroll;
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
