<template>
    <div v-if="props.dayInfo" class="week">
        <div class="day_of_week_headers">
            <DayOfWeekHeader
                :year="props.year"
                :month="props.dayInfo.month"
                :day="props.dayInfo.date"
                :day-name="dayName"
                @mousedown="onAddEventForDay"
            />
        </div>
        <div class="day_container">
            <div class="day_list">
                <DayOfWeek
                    :index="0"
                    :day-name="dayName"
                    :is-include-time-label="true"
                    :is-selecting="isSelecting"
                    :selected-items="selectedItems"
                    @time-on-mouse-down="onMouseDown"
                    @time-on-mouse-over="onMouseOver"
                    @time-on-mouse-up="onAddEventForTimes"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { toRef, watch, onMounted, computed } from 'vue';

    import type { IDayInfo, IEvent } from '@/interfaces';

    import DayOfWeekHeader from './DayOfWeekHeader.vue';
    import DayOfWeek from './DayOfWeek.vue';

    import { TIMES_IN_DAY } from '@/composables/use-date-utils';
    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';

    interface IDayLayoutProps {
        year: number;
        dayInfo: IDayInfo;
    }

    const props: IDayLayoutProps = defineProps<IDayLayoutProps>();

    const {
        state,
        initIndices,
        onMouseDown,
        onMouseOver,
        onMouseUp,
    } = useMouseItemSelect();

    const selectedItems = toRef(state, 'selectedItems');
    const isSelecting = toRef(state, 'isSelecting');

    const emit = defineEmits(['addEvent']);

    const dayName = computed(() => (props.dayInfo.dayName) ? props.dayInfo.dayName : '');

    const initHourIndices = () => {
        initIndices<string>(TIMES_IN_DAY);
    };

    const addEvent = (times: { start: number, end: number }) => {
        const { date, month } = props.dayInfo;
        const year = props.year;

        const event: IEvent = {
            times,
            dates: {
                start: date,
                end: date,
            },
            month,
            year,
        };

        emit('addEvent', event);
    };

    const onAddEventForDay = () => {
        const times = { start: 0, end: TIMES_IN_DAY.length - 1 };
        addEvent(times);
    };

    const onAddEventForTimes = (index: number) => {
        const items = selectedItems.value;
        const start = items[0];
        const end = items[items.length - 1];

        addEvent({ start, end });

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

.week {
    height: calc(100% - 98px);

    flex: 1;
    display: flex;
    flex-direction: column;

    border-left: 1px #ccc solid;
    border-bottom: 1px #ccc solid;
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

    border-top: 1px #ccc solid;
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
    border-right: 1px #ccc solid;
    /* border-bottom: 1px #ccc solid; */

    color: #777;
}

.day_list {
    flex: 1;
    display: flex;
}

</style>
