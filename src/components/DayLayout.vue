<template>
    <div v-if="props.dayInfo" class="week">
        <div class="day_of_week_headers">
            <!-- <DayOfWeekHeader
                :year="props.year"
                :month="props.dayInfo.month"
                :day="props.dayInfo.date"
                :day-name="dayName"
                @mousedown="onAddEventForDay"
            /> -->
        </div>
        <div class="day_container">
            <div class="day_list">
                <!-- <DayOfWeek
                    :index="0"
                    :day-name="dayName"
                    :is-include-time-label="true"
                    :is-selecting="isSelecting"
                    :is-start-on-second-half="isStartOnSecondHalf"
                    :is-end-on-first-half="isEndOnFirstHalf"
                    :selected-items="selectedItems"
                    :current-initiator="currentInitiator"
                    :events="[]"
                    @time-on-mouse-down="onMouseDown"
                    @time-on-mouse-over="onMouseOver"
                    @time-on-mouse-up="onAddEventForTimes"
                /> -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { toRef, watch, onMounted, computed } from 'vue';

    import type { IDayInfo, IEvent } from '@/interfaces';

    import DayOfWeekHeader from './DayOfWeekHeader.vue';
    import DayOfWeek from './DayOfWeek.vue';

    import { DAYS_OF_WEEK, TIMES_IN_DAY } from '@/composables/use-date-utils';
    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';

    interface IDayLayoutProps {
        year: number;
        dayInfo: Date;
    }

    const props: IDayLayoutProps = defineProps<IDayLayoutProps>();

    const {
        state,
        initIndices,
        getNumberValuesFromItems,
        onMouseDown,
        onMouseOver,
        onMouseUp,
    } = useMouseItemSelect();

    const selectedItems = toRef(state, 'selectedItems');
    const isSelecting = toRef(state, 'isSelecting');
    const isStartOnSecondHalf = toRef(state, 'isStartOnSecondHalf');
    const isEndOnFirstHalf = toRef(state, 'isEndOnFirstHalf');
    const currentInitiator = toRef(state, 'currentInitiator');

    const emit = defineEmits(['addEvent']);

    const dayName = computed(() => DAYS_OF_WEEK[props.dayInfo.getDay()]);

    const initHourIndices = () => {
        initIndices<string>(TIMES_IN_DAY);
    };

    const addEvent = (times: { start: number, end: number }) => {
        const date = props.dayInfo.getDate();
        const month = props.dayInfo.getMonth();
        const year = props.year;

        const event: Partial<IEvent> = {
            start: {
                year,
                month,
                day: date,
                time: times.start,
            },
            end: {
                year,
                month,
                day: date,
                time: times.end,
            },
        };

        emit('addEvent', event);
    };

    const onAddEventForDay = () => {
        const times = { start: 0, end: TIMES_IN_DAY.length - 1 };
        addEvent(times);
    };

    const onAddEventForTimes = (index: number) => {
        addEvent(getNumberValuesFromItems());
        onMouseUp();
    };

    watch(() => props.dayInfo, () => {
        initHourIndices();
    });

    onMounted(() => {
        console.log(`DayLayout/onMounted, props = `, props);
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

        border-left: 1px solid $borderColor01;
        border-bottom: 1px solid $borderColor01;
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

        border-right: 1px solid $borderColor01;

        color: $primaryBg01;
    }

    .day_list {
        flex: 1;
        display: flex;
    }

</style>
