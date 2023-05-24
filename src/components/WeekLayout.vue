<template>
    <div class="week" ref="weekEl">
        <div
            class="day_of_week_headers"
            ref="headerEl"
        >
            <DayOfWeekHeader
                v-for="(day, d) in props.weekInfo.days"
                :key="`${props.year}${day.month}${day.date}${d}`"
                :year="props.year"
                :month="day.month"
                :day="day.date"
                :day-name="day.dayName"
                @date-clicked="$emit('dateClicked', { day: d, week: props.index })"
            />
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
                    :events="weekEvents(d2)"
                    @time-on-mouse-down="onMouseDown"
                    @time-on-mouse-over="onMouseOver"
                    @time-on-mouse-up="onAddEventForTimes(d2)"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { toRef, watch, computed, onMounted } from 'vue';

    import type { IEvent, IWeekInfo } from '@/interfaces';

    import { TIMES_IN_DAY } from '@/composables/use-date-utils';

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

    const { getEventsForRange } = useEventStore();

    const selectedItems = toRef(state, 'selectedItems');
    const isSelecting = toRef(state, 'isSelecting');
    const isStartOnSecondHalf = toRef(state, 'isStartOnSecondHalf');
    const isEndOnFirstHalf = toRef(state, 'isEndOnFirstHalf');
    const currentInitiator = toRef(state, 'currentInitiator');

    const emit = defineEmits(['addEvent']);

    const initHourIndices = () => {
        initIndices<string>(TIMES_IN_DAY);
    };

    const onAddEventForTimes = (index: number) => {
        const times = getTimesFromItems();
        const date = props.weekInfo.days[index].date;
        const { month, year } = props;

        const event: Partial<IEvent> = {
            times,
            dates: {
                start: date,
                end: date,
            },
            month,
            year,
        };

        emit('addEvent', event);

        onMouseUp();
    };

    watch(() => props.weekInfo, () => {
        initHourIndices();
    });

    const weekEvents = (index: number) => {
        const days = props.weekInfo.days;
        return getEventsForRange(props.year, props.month, days[index].date, days[index].date);
    };

    onMounted(() => {
        initHourIndices();
    });
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';

    .week {
        height: calc(100% - 98px);

        flex: 1;
        display: flex;
        flex-direction: column;

        position: relative;

        border-left: 1px solid $border-color01;
        border-bottom: 1px solid $border-color01;
    }

    @media screen and (max-width: 400px) {
        .week {
            height: calc(100% - 144px);
        }
    }

    .day_of_week_headers {
        width: 100%;
        display: flex;

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

</style>
