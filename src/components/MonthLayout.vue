<template>
    <div v-if="props.currentMonth" class="month">
        <DaysOfWeekNames />
        <div class="week">
            <DayOfMonth
                v-for="(day, d) in currentMonth"
                :key="`${props.year}${props.month}${day.getDate()}${d}`"
                :index="d"
                :year="props.year"
                :month="day.getMonth()"
                :currentMonth="props.month"
                :day="day.getDate()"
                :is-selecting="isSelecting"
                :is-selected="selectedItems.includes(d)"
                @date-clicked="onDateClicked(d)"
                @day-on-mouse-down="onMouseDown"
                @day-on-mouse-over="onMouseOver"
                @day-on-mouse-up="onAddEventForDay"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { toRef, watch, onMounted } from 'vue';

    import type { IEvent, IMonthData, IYearMonthDayTime } from '@/interfaces';

    import DayOfMonth from './DayOfMonth.vue';
    import DaysOfWeekNames from './DaysOfWeekNames.vue';

    import { TIMES_IN_DAY } from '@/composables/use-date-utils';
    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';
    import { useCalendarStore } from '@/stores/calendar';

    interface IMonthProps {
        year: number;
        month: number;
        currentMonth: Date[];
    }

    const props: IMonthProps = defineProps<IMonthProps>();

    const {
        state,
        initIndices,
        onMouseDown,
        onMouseOver,
        onMouseUp,
    } = useMouseItemSelect();

    const { getWeekForDate } = useCalendarStore();

    const selectedItems = toRef(state, 'selectedItems');
    const isSelecting = toRef(state, 'isSelecting');

    const emit = defineEmits(['addEvent', 'dateClicked']);

    const initAllDays = () => {
        if (!props.currentMonth) {
            return;
        }
        initIndices<Date>(props.currentMonth);
    };

    const getYearMonthDateTime = (date: Date, time: number): IYearMonthDayTime => {
        return {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
            time,
        };
    };

    const onAddEventForDay = () => {
        if (!props.currentMonth) {
            return;
        }
        // const start = getYearMonthDateTime(props.currentMonth[selectedItems.value[0]], 0);
        // const end = getYearMonthDateTime(props.currentMonth[selectedItems.value[selectedItems.value.length - 1]], TIMES_IN_DAY.length - 1);

        // const event: Partial<IEvent> = {
        //     start,
        //     end,
        // };

        // emit('addEvent', event);

        onMouseUp();
    };

    const onDateClicked = (index: number) => {
        if (!props.currentMonth) {
            console.warn(`WARNING: no month info present`);
            return;
        }

        const target = props.currentMonth[index];
        const day = target.getDate();
        const week = getWeekForDate(target);

        emit('dateClicked', { day, week });
    };

    watch(() => props.month, () => {
        initAllDays();
    });

    onMounted(() => {
        initAllDays();
    });
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';

    .month {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;

        border-left: 1px solid $borderColor01;
    }

    .week {
        width: 100%;
        height: 100%;
        flex: 1;
        display: flex;
        flex-wrap: wrap;
    }

</style>
