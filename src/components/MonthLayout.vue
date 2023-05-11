<template>
    <div v-if="props.monthInfo" class="month">
        <DaysOfWeekNames />
        <div class="week">
            <DayOfMonth
                v-for="(day, i) in props.monthInfo.days"
                :key="`${props.year}${props.month}${day.date}${i}`"
                :index="i"
                :year="props.year"
                :month="day.month"
                :currentMonth="props.month"
                :day="day.date"
                :is-selecting="isSelecting"
                :is-selected="selectedItems.includes(i)"
                @date-clicked="onDateClicked(i)"
                @day-on-mouse-down="onMouseDown"
                @day-on-mouse-over="onMouseOver"
                @day-on-mouse-up="onAddEventForDay(i)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { toRef, watch, onMounted } from 'vue';

    import type {
        IDayInfo,
        IEvent,
        IMonthInfo,
    } from '@/interfaces';

    import DayOfMonth from './DayOfMonth.vue';
    import DaysOfWeekNames from './DaysOfWeekNames.vue';

    import { TIMES_IN_DAY } from '@/composables/use-date-utils';
    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';

    interface IMonthProps {
        year: number;
        month: number;
        monthInfo: IMonthInfo | undefined;
    }

    const props: IMonthProps = defineProps<IMonthProps>();

    const {
        state,
        initIndices,
        onMouseDown,
        onMouseOver,
        onMouseUp,
    } = useMouseItemSelect();

    const selectedItems = toRef(state, 'selectedItems');
    const isSelecting = toRef(state, 'isSelecting');

    const emit = defineEmits(['addEvent', 'dateClicked']);

    const initAllDays = () => {
        if (!props.monthInfo) {
            return;
        }
        initIndices<IDayInfo>(props.monthInfo.days);
    };

    const onAddEventForDay = (index: number) => {
        if (!props.monthInfo) {
            return;
        }
        const times = { start: 0, end: TIMES_IN_DAY.length - 1 };
        const start = props.monthInfo.days[selectedItems.value[0]].date;
        const end = props.monthInfo.days[selectedItems.value[selectedItems.value.length - 1]].date;
        const { month, year } = props;

        const event: IEvent = {
            times,
            dates: {
                start,
                end,
            },
            month,
            year,
        };

        emit('addEvent', event);

        onMouseUp();
    };

    const onDateClicked = (index: number) => {
        if (!props.monthInfo) {
            console.warn(`WARNING: no month info present`);
            return;
        }

        const date = props.monthInfo.days[index].date;
        let week = -1;
        let day = -1;
        for (let w = 0; w < props.monthInfo.weeks.length; w++) {
            for (let d = 0; d < props.monthInfo.weeks[w].days.length; d++) {
                if (props.monthInfo.weeks[w].days[d].date === date) {
                    week = w;
                    day = d;
                }
            }
        }

        if (week === -1 || day === -1) {
            console.warn(`WARNING: could not find week containing date ${day}`);
            return;
        }

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
    @import '../styles/variables.scss';

    .month {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;

        border-left: 1px solid $border-color01;
    }

    .week {
        width: 100%;
        height: 100%;
        flex: 1;
        display: flex;
        flex-wrap: wrap;
    }

</style>
