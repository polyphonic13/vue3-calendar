<template>
    <div v-if="props.currentMonth" class="month">
        <DaysOfWeekNames />
        <div
            v-for="(week, w) in weeklyEvents"
            :key="w"
            class="week"
        >
            <div class="day_list">
                <DayOfMonth
                    v-for="(day, d) in week"
                    :key="`${day.getFullYear()}${day.getMonth()}${day.getDate()}`"
                    :index="getDayIndex(w, d)"
                    :year="props.year"
                    :month="day.getMonth()"
                    :currentMonth="props.month"
                    :date="day"
                    :day="day.getDate()"
                    :is-selecting="isSelecting"
                    :is-selected="selectedItems.includes(getDayIndex(w, d))"
                    @date-clicked="onDateClicked(getDayIndex(w, d))"
                    @day-on-mouse-down="onMouseDown"
                    @day-on-mouse-over="onMouseOver"
                    @day-on-mouse-up="onAddEventForDay"
                />
            </div>
            <WeeklyEventCards
                :index="w"
                :week-dates="week"
                :is-include-hourly-events="true"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { toRef, watch, onMounted, computed } from 'vue';

    import { useCalendarStore } from '@/stores/calendar';

    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';

    import DayOfMonth from './DayOfMonth.vue';
    import DaysOfWeekNames from './DaysOfWeekNames.vue';
    import WeeklyEventCards from './events/WeeklyEventCards.vue';

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

    const emit = defineEmits(['createEvent', 'dateClicked']);

    watch(() => props.month, () => {
        initAllDays();
    });

    const weeklyEvents = computed(() => {
        const weeks: Date[][] = [];
        let week: Date[] = [];

        const l = props.currentMonth.length;
        for (let i = 0; i < l; i++) {
            if (i % 7 === 0 && i > 0) {
                weeks.push(week);
                week = [];
            }
            week.push(props.currentMonth[i]);
        }
        weeks.push(week);

        return weeks;
    });

    const getDayIndex = (row: number, col: number) => {
        return props.currentMonth.findIndex((date) => date.getTime() === weeklyEvents.value[row][col].getTime());
    };

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

        console.log(`onAddEventForDay, selectedItems.value[0] = ${selectedItems.value[0]}, selectedItems.value[selectedItems.value.length] = ${selectedItems.value[selectedItems.value.length - 1]}\n`, props.currentMonth[selectedItems.value[0]], props.currentMonth[selectedItems.value[selectedItems.value.length - 1]]);
        const start = new Date(props.currentMonth[selectedItems.value[0]].toJSON());
        const end = new Date(props.currentMonth[selectedItems.value[selectedItems.value.length - 1]].toJSON());

        emit('createEvent', { start, end });

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
        flex-direction: column;
    }

    .day_list {
        width: 100%;
        display: flex;
    }

    .weekly_event_cards {
        flex: 1;
    }
</style>
