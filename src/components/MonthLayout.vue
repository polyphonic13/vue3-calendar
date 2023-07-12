<template>
    <div v-if="weeklyDates" class="month">
        <DaysOfWeekNames />
        <div
            v-for="(week, w) in weeklyDates"
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
                    :day="day.getDate()"
                    :is-selecting="isSelecting"
                    :is-selected="selectedItems.includes(getDayIndex(w, d))"
                    @date-clicked="onDateClicked(getDayIndex(w, d))"
                    @day-on-mouse-down="onMouseDown"
                    @day-on-mouse-over="onMouseOver"
                    @day-on-mouse-up="onAddEventForDay"
                />
            </div>
            <EventCards
                :index="w"
                :week-dates="week"
                :is-include-hourly-events="true"
                :is-week="true"
            />
        </div>
        <EventListModal v-if="isViewEventList" />
    </div>
</template>

<script setup lang="ts">
    import { toRef, watch, onMounted, computed } from 'vue';

    import { useCalendarStore } from '@/stores/calendar';

    import { useCalendarByMonth } from '@/composables/use-calendar-by-month';
    import { useMouseItemSelect } from '@/composables/use-mouse-item-select';
    import { useEventListModal } from '@/composables/use-event-list-modal';

    import DayOfMonth from './DayOfMonth.vue';
    import DaysOfWeekNames from './DaysOfWeekNames.vue';
    import EventCards from './events/EventCards.vue';
    import EventListModal from './events/EventListModal.vue';

    interface IMonthProps {
        year: number;
        month: number;
    }

    const props = defineProps<IMonthProps>();

    const {
        weeklyDates,
        currentMonth,
        setMonthAndYear,
    } = useCalendarByMonth();

    const {
        state,
        initIndices,
        onMouseDown,
        onMouseOver,
        onMouseUp,
    } = useMouseItemSelect();

    const { getWeekForDate } = useCalendarStore();

    const { getIsEventListVisible } = useEventListModal();

    const selectedItems = toRef(state, 'selectedItems');
    const isSelecting = toRef(state, 'isSelecting');

    const emit = defineEmits(['createEvent', 'dateClicked']);

    watch(() => props.month, () => {
        setMonthAndYear(props.month, props.year);
        initSelectionItemsWithDays();
    });

    const isViewEventList = computed(() => {
        return getIsEventListVisible();
    });

    const getDayIndex = (row: number, col: number) => {
        return currentMonth.value.findIndex((date) => date.getTime() === weeklyDates.value[row][col].getTime());
    };

    const initSelectionItemsWithDays = () => {
        if (!currentMonth.value) {
            return;
        }
        initIndices<Date>(currentMonth.value);
    };

    const onAddEventForDay = () => {
        if (!currentMonth.value) {
            return;
        }

        const start = new Date(currentMonth.value[selectedItems.value[0]].toJSON());
        const end = new Date(currentMonth.value[selectedItems.value[selectedItems.value.length - 1]].toJSON());

        const event = {
            start,
            end,
            isAllDay: true,
        };

        emit('createEvent', event);

        onMouseUp();
    };

    const onDateClicked = (index: number) => {
        if (!currentMonth.value) {
            console.warn(`WARNING: no month info present`);
            return;
        }

        const target = currentMonth.value[index];
        const day = target.getDate();
        const week = getWeekForDate(target);

        emit('dateClicked', { day, week });
    };

    onMounted(() => {
        setMonthAndYear(props.month, props.year);
        initSelectionItemsWithDays();
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
        border-bottom: 1px solid $borderColor01;
        box-sizing: border-box;
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
        flex: 1;
        display: flex;
    }

    .weekly_event_cards {
        flex: 1;
    }

</style>
