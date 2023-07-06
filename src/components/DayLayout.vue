<template>
    <div class="day_layout" ref="dayEl">
        <DayOfWeekHeader
            :index="0"
            :year="year"
            :month="month"
            :day="day"
            :day-name="DAYS_OF_WEEK[props.date.getDay()]"
            :is-selecting="isSelecting"
            :selected-items="selectedItems"
            :current-initiator="currentInitiator"
            :current-type="currentType"
            :is-emit-date-clicked="false"
            @day-on-mouse-down="onDayMouseDown"
            @day-on-mouse-over="onDayMouseOver"
            @day-on-mouse-up="onDayMouseUp"
        />
        <EventCards
            :index="0"
            :week-dates="[props.date]"
            :is-include-hourly-events="false"
            :is-week="false"
        />
        <div class="day_container">
            <div class="day_of_week_list">
                <DayOfWeek
                    :index="0"
                    :day-name="DAYS_OF_WEEK[props.date.getDay()]"
                    :is-include-time-label="true"
                    :is-selecting="isSelecting"
                    :is-start-on-second-half="isStartOnSecondHalf"
                    :is-end-on-first-half="isEndOnFirstHalf"
                    :selected-items="selectedItems"
                    :current-initiator="currentInitiator"
                    :current-type="currentType"
                    :events="getHourlyEventsForDate(props.date, hourlyEvents)"
                    @time-on-mouse-down="onTimeMouseDown"
                    @time-on-mouse-over="onTimeMouseOver"
                    @time-on-mouse-up="onTimeMouseUp"
                />
            </div>
        </div>
        <EventListModal v-if="isViewEventList" />
    </div>
</template>

<script setup lang="ts">
    // external
    import {
        toRef,
        watch,
        onMounted,
        computed,
    } from 'vue';

    // interfaces, types and enums
    import type { IYearMonthDay } from '@/interfaces';

    import { MouseSelectionType } from '@/enum/MouseSelectionType';

    // composables
    import {
        TIMES_IN_DAY,
        DAYS_OF_WEEK,
        useDateUtils,
    } from '@/composables/use-date-utils';

    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';
    import { useComputedEventLists } from '@/composables/use-computed-event-lists';
    import { useEventListModal } from '@/composables/use-event-list-modal';

    // components
    import DayOfWeekHeader from './DayOfWeekHeader.vue';
    import DayOfWeek from './DayOfWeek.vue';
    import EventCards from './events/EventCards.vue';
    import EventListModal from './events/EventListModal.vue';

    interface IDayProps {
        date: Date;
    }

    const props: IDayProps = defineProps<IDayProps>();

    const { getYMDFromDate, getHHMMFromNumber } = useDateUtils();

    const {
        setStartDate,
        setEndDate,
        hourlyEvents,
        getHourlyEventsForDate,
    } = useComputedEventLists();

    const {
        state,
        initIndices,
        getNumberValuesFromItems,
        onMouseDown,
        onMouseOver,
        onMouseUp,
    } = useMouseItemSelect();

    const { getIsEventListVisible } = useEventListModal();

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

    const year = computed(() => {
        return props.date.getFullYear();
    });

    const month = computed(() => {
        return props.date.getMonth();
    });

    const day = computed(() => {
        return props.date.getDate();
    });

    const isViewEventList = computed(() => {
        return getIsEventListVisible();
    });

    watch(() => props.date, () => {
        setStartAndEndDate();
        initHourIndices();
    });

    const emitCreateEvent = (start: Date, end: Date) => {
        if (isViewEventList.value) {
            return;
        }

        const event = {
            start,
            end,
        };

        emit('createEvent', event);
    };

    const initHourIndices = () => {
        initIndices<string>(TIMES_IN_DAY);
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

    const getDateFromTimes = (raw: number, ymd: IYearMonthDay) => {
        const { hh, mm } = getHHMMFromNumber(raw);
        return new Date(ymd.year, ymd.month, ymd.day, hh, mm);
    };

    const onTimeMouseUp = () => {
        const times = getNumberValuesFromItems();
        const { year, month, day } = getYMDFromDate(props.date);

        const start = getDateFromTimes(times.start, { year, month, day });
        const end = getDateFromTimes(times.end, { year, month, day });

        emitCreateEvent(start, end);
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

        const startDay = getYMDFromDate(props.date);
        const endDay = getYMDFromDate(props.date);

        const start = getDateFromTimes(0, { ...startDay });
        const end = getDateFromTimes(0, { ...endDay });

        emitCreateEvent(start, end);
        onMouseUp();
    };

    const setStartAndEndDate = () => {
        setStartDate(props.date);
        setEndDate(props.date);
    };

    onMounted(() => {
        setStartAndEndDate();
        initHourIndices();
    });
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';
    @import '../styles/mixins.scss';

    .day_layout {
        // height: calc(100% - 98px);

        flex: 1;
        display: flex;
        flex-direction: column;

        border-left: 1px solid $borderColor01;
        border-bottom: 1px solid $borderColor01;
        box-sizing: border-box;

        overflow: hidden;
    }

    .day_of_week_header {
        height: 92px;
        border-right: 1px solid $borderColor01;
    }

    .day_container {
        @include day_container;
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

    .day_of_week_list {
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
