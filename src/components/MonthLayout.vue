<template>
    <div v-if="props.currentMonth" class="month">
        <DaysOfWeekNames />
        <div class="week">
            <DayOfMonth
                v-for="(day, d) in currentMonth"
                :key="`${day.getFullYear()}${day.getMonth()}${day.getDate()}`"
                :index="d"
                :year="props.year"
                :month="day.getMonth()"
                :currentMonth="props.month"
                :date="day"
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
    import { toRef, watch, onMounted, computed } from 'vue';

    import DayOfMonth from './DayOfMonth.vue';
    import DaysOfWeekNames from './DaysOfWeekNames.vue';

    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';
    import { useCalendarStore } from '@/stores/calendar';
    import { useEventStore } from '@/stores/events';

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

    const { getEventsForRange } = useEventStore();

    const selectedItems = toRef(state, 'selectedItems');
    const isSelecting = toRef(state, 'isSelecting');

    const emit = defineEmits(['addEvent', 'dateClicked']);

    watch(() => props.month, () => {
        initAllDays();
    });

    const monthEvents = computed(() => {
        return getEventsForRange(props.currentMonth[0], props.currentMonth[props.currentMonth.length - 1]);
    });

    const initAllDays = () => {
        if (!props.currentMonth) {
            return;
        }
        initIndices<Date>(props.currentMonth);
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

    onMounted(() => {
        initAllDays();
        console.log(`MonthLayout/onMounted, monthEvents = `, monthEvents.value);
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
