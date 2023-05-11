<template>
    <div class="calendar">
        <div class="header">
            <div class="header__content">
                <span class="title">{{ headerTitle }}</span>
                <span v-if="state.layout === CalendarLayout.WEEK && state.monthInfo">WEEK {{ state.monthInfo.weeks[state.weekIndex].weekNumber }}</span>
            </div>
            <div class="controls">
                <button class="control__btn arrow_btn" @click="onPrevClicked">
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </button>
                <button class="control__btn arrow_btn" @click="onNextClicked">
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>
                <button class="control__btn today_btn" @click="onTodayClicked">TODAY</button>
                <LayoutSelector
                    :layout="state.layout"
                    @layout-btn-clicked="onLayoutBtnClicked"
                />
            </div>
        </div>

        <MonthLayout
            v-if="state.layout === CalendarLayout.MONTH && state.monthInfo && !isUpdating"
            :year="state.year"
            :month="state.monthIndex"
            :month-info="state.monthInfo"
            @date-clicked="onDateClicked"
            @add-event="onAddEvent"
        />
        <WeekLayout
            v-if="state.layout === CalendarLayout.WEEK && state.monthInfo && !isUpdating"
            :year="state.year"
            :month="state.monthIndex"
            :index="state.weekIndex"
            :week-info="state.monthInfo.weeks[state.weekIndex]"
            @date-clicked="onDateClicked"
            @add-event="onAddEvent"
        />
        <DayLayout
            v-if="state.layout === CalendarLayout.DAY && state.monthInfo && !isUpdating"
            :year="state.year"
            :day-info="state.monthInfo.weeks[state.weekIndex].days[state.dayIndex]"
            @add-event="onAddEvent"
        />
    </div>
</template>

<script setup lang="ts">
    import { reactive, computed, onMounted } from 'vue';

    import { CalendarLayout } from '../enum/CalendarLayout';

    import type {
        IDayInfo,
        IMonthInfo,
        IEvent,
    } from '../interfaces';

    import {
        MONTH_NAMES,
        getMonthInfo,
        getMonthInfoForToday,
    } from '../composables/use-date-utils'

    import MonthLayout from '@/components/MonthLayout.vue';
    import WeekLayout from '@/components/WeekLayout.vue';
    import DayLayout from '@/components/DayLayout.vue';
    import LayoutSelector from '@/components/LayoutSelector.vue';

    interface ICalendarProps {
        layout?: CalendarLayout,
        year?: number,
        month?: number,
    }

    interface ICalendarState {
        layout: CalendarLayout;
        monthInfo?: IMonthInfo;
        year: number;
        monthIndex: number;
        weekIndex: number;
        dayIndex: number;
    }

    const props = defineProps<ICalendarProps>();

    let monthInfo: IMonthInfo | undefined;

    const today = new Date();

    const state: ICalendarState = reactive({
        layout: CalendarLayout.MONTH,
        monthInfo,
        year: today.getFullYear(),
        monthIndex: new Date().getMonth(),
        weekIndex: 0,
        dayIndex: 0,
    });

    const headerTitle = computed(() => {
        if (state.layout !== CalendarLayout.WEEK) {
            return `${MONTH_NAMES[state.monthIndex]} ${state.year}`;
        }

        const weekInfo = state.monthInfo!.weeks[state.weekIndex];
        const monthIndices: number[] = [];

        weekInfo.days.forEach((day: IDayInfo) => {
            if (monthIndices.indexOf(day.month) === -1) {
                monthIndices.push(day.month);
            }
        });

        const months = monthIndices.map((index) => MONTH_NAMES[index]);

        return `${months.join(' - ')} ${state.year}`;
    });

    let isUpdating = false;

    onMounted(() => {
        // console.log(`Calendar/onMounted, props = ${JSON.stringify(props)}`);
        updateMonthInfo();
        const todayIndices = state.monthInfo!.todayIndices;
        state.weekIndex = todayIndices.week;
        state.dayIndex = todayIndices.day;
    });

    const updateMonthInfo = () => {
        state.monthInfo = getMonthInfo(state.year, state.monthIndex);
        // console.log(`get month info: `, state.monthInfo);
        isUpdating = false;
    };

    const updateMonth = () => {
        const monthOfCurrentDay = state.monthInfo!.weeks[state.weekIndex].days[state.dayIndex].month
        if (monthOfCurrentDay === state.monthIndex) {
            return;
        }
        // the month changed during an increment/decrement, request new month info
        const previousIndex = state.monthIndex;
        state.monthIndex = monthOfCurrentDay;
        updateMonthInfo();
        state.weekIndex = (previousIndex > monthOfCurrentDay) ? state.monthInfo!.weeks.length - 1 : 0;
    };

    const updateMonthInfoToToday = () => {
        state.monthInfo = getMonthInfoForToday();
    }

    const updateWeekAndDayIndices = (indices: { week: number, day: number }) => {
        if (!state.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        const { week, day } = indices;

        state.weekIndex = week;
        state.dayIndex = day;

        isUpdating = false;
    };

    const incrementMonth = () => {
        isUpdating = true;

        state.weekIndex = 0;
        state.dayIndex = 0;
        // console.log(`incrementMonth`)
        if (state.monthIndex < MONTH_NAMES.length - 1) {
            // console.log(`\tthere are still month months in the year...`);
            state.monthIndex++;
            updateMonthInfo();
            return;
        }

        // console.log(`\treached last month, incrementing to next year`);
        state.year++;
        state.monthIndex = 0;
        updateMonthInfo();
    };

    const decrementMonth = () => {
        isUpdating = true;

        state.dayIndex = 0;

        if (state.monthIndex > 0) {
            state.monthIndex--;
            updateMonthInfo();
            isUpdating = false;
            return;
        }

        state.year--;
        state.monthIndex = MONTH_NAMES.length - 1;
        updateMonthInfo();

        isUpdating = false;
    };

    const incrementWeek = () => {
        if (!state.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        state.dayIndex = 0;

        if (state.weekIndex < state.monthInfo.weeks.length - 1) {
            state.weekIndex++;
            isUpdating = false;
            return;
        }
        // console.log(`week at last entry, going to increment month`);
        incrementMonth();
    };

    const decrementWeek = () => {
        if (!state.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        state.dayIndex = 0;

        if (state.weekIndex > 0) {
            state.weekIndex--;
            isUpdating = false;
            return;
        }

        decrementMonth();
        state.weekIndex = state.monthInfo.weeks.length - 2;
    };

    const incrementDay = () => {
        if (!state.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        if (state.dayIndex < 6) {
            state.dayIndex++;
            updateMonth();
            isUpdating = false;
            // console.log(`incremented day, dayIndex now = ${state.dayIndex}`);
            return;
        }

        if (state.weekIndex < state.monthInfo.weeks.length - 1) {
            state.weekIndex++;
            state.dayIndex = 0;
            // console.log(`incremented week, week & day indices now = ${state.weekIndex}, ${state.dayIndex}`);
            updateMonth();
            isUpdating = false;
            return;
        }

        state.monthIndex = (state.monthIndex < MONTH_NAMES.length - 1) ? state.monthIndex + 1 : 0;
        state.dayIndex = 0;
        state.weekIndex = 0;
        // console.log(`updated month, focused month now = ${state.monthIndex}`);

        if (state.monthIndex === 0) {
            state.year++;
            // console.log(`incremented year`);
        }

        updateMonthInfo();
        state.weekIndex = 0;
        state.dayIndex = 0;

        isUpdating = false;
    };

    const decrementDay = () => {
        if (!state.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        if (state.dayIndex > 0) {
            state.dayIndex--;
            // console.log(`decremented day, dayIndex now = ${state.dayIndex}`);
            updateMonth();
            isUpdating = false;
            return;
        }

        if (state.weekIndex > 0) {
            state.weekIndex--;
            state.dayIndex = state.monthInfo.weeks[state.weekIndex].days.length - 1;
            // console.log(`decremented week, week & day indices now = ${state.weekIndex}, ${state.dayIndex}`);
            updateMonth();
            isUpdating = false;
            return;
        }

        state.monthIndex = (state.monthIndex > 0) ? state.monthIndex - 1 : MONTH_NAMES.length - 1;
        // console.log(`updated month, focused month now = ${state.monthIndex}`);

        if (state.monthIndex === MONTH_NAMES.length - 1) {
            state.year--;
            // console.log(`decremented year`);
        }

        // console.log(`week & day indices now = ${state.weekIndex}, ${state.dayIndex}`)
        updateMonthInfo();
        state.weekIndex = state.monthInfo.weeks.length - 1;
        state.dayIndex = state.monthInfo.weeks[state.weekIndex].days.length - 1;

        isUpdating = false;
    };

    const DECREMENT_METHODS = {
        [CalendarLayout.YEAR]: () => {},
        [CalendarLayout.MONTH]: decrementMonth,
        [CalendarLayout.WEEK]: decrementWeek,
        [CalendarLayout.DAY]: decrementDay,
    };

    const onPrevClicked = () => {
        if (!DECREMENT_METHODS[state.layout]) {
            return;
        }
        DECREMENT_METHODS[state.layout]();
    };

    const INCREMENT_METHODS = {
        [CalendarLayout.YEAR]: () => {},
        [CalendarLayout.MONTH]: incrementMonth,
        [CalendarLayout.WEEK]: incrementWeek,
        [CalendarLayout.DAY]: incrementDay,
    };

    const onNextClicked = () => {
        if (!INCREMENT_METHODS[state.layout]) {
            return;
        }
        INCREMENT_METHODS[state.layout]();
    };

    const onTodayClicked = () => {
        if (!state.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;
        updateMonthInfoToToday();

        const { month, week, day } = state.monthInfo.todayIndices;
        if (month === -1 || week === -1 || day === -1) {
            console.warn(`WARNING: today indices returned month ${month} week ${week}, day ${day}`);
            return
        }

        state.year = new Date().getFullYear();
        state.monthIndex = month;
        state.weekIndex = week
        state.dayIndex = day;

        isUpdating = false;
    };

    const onDayLayoutClicked = () => {
        if (!state.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        if (state.layout === CalendarLayout.DAY) {
            return;
        }
        isUpdating = true;

        state.layout = CalendarLayout.DAY;

        const { month, week, day } = state.monthInfo.todayIndices;

        if (month === -1 || week === -1 || day === -1) {
            const dayIndex = state.monthInfo.weeks[0].days.findIndex(day => day.month === state.monthIndex);
            updateWeekAndDayIndices({ week: 0, day: dayIndex });
            return;
        }

        updateWeekAndDayIndices({ week, day });
    };

    const onWeekLayoutClicked = () => {
        if (state.layout === CalendarLayout.WEEK) {
            return;
        }
        state.layout = CalendarLayout.WEEK;
    };

    const onMonthLayoutClicked = () => {
        if (state.layout === CalendarLayout.MONTH) {
            return;
        }
        state.layout = CalendarLayout.MONTH;
    };

    const onYearLayoutClicked = () => {

    };

    const LAYOUT_UPDATE_METHODS = {
        [CalendarLayout.DAY]: onDayLayoutClicked,
        [CalendarLayout.WEEK]: onWeekLayoutClicked,
        [CalendarLayout.MONTH]: onMonthLayoutClicked,
        [CalendarLayout.YEAR]: onYearLayoutClicked,
    };

    const onLayoutBtnClicked = (type: CalendarLayout) => {
        if (!LAYOUT_UPDATE_METHODS[type]) {
            return;
        }

        LAYOUT_UPDATE_METHODS[type]();
    };

    const onDateClicked = (indices: { week: number, day: number }) => {

        if (state.layout === CalendarLayout.DAY) {
            return;
        }

        isUpdating = true;

        updateWeekAndDayIndices(indices);

        state.layout = CalendarLayout.DAY;
    };

    const onAddEvent = (event: IEvent) => {
        console.log(`Calendar/onAddEvent, event = ${JSON.stringify(event)}`);
    }
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';

    .calendar {
        height: 100%;
        flex: 1;

        padding: 16px;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;

    }

    .header {
        width: 100%;
        padding-bottom: 16px;

        text-align: center;
        box-sizing: border-box;

        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .header__content {
        margin: 0 8px 0 8px;

        display: flex;
        align-items: center;
    }

    .header__content > * {
        padding: 8px;
    }

    .title, .year {
        font-size: 2em;
    }

    .controls {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .day_names {
        background-color: #fff;
        width: 100%;
        height: 28px;
        box-sizing: border-box;

        display: flex;
    }

    .day_name {
        text-align: center;
        width: calc(100%/7);
        height: 100%;

        box-sizing: border-box;
        border-right: 1px solid $border-color01;
        border-bottom: 1px solid $border-color01;

        display:flex;
        align-items: center;
        justify-content: center;
    }

    .control__btn {
        background: none;
        border: none;

        box-sizing: border-box;

        margin: 0 4px 0 4px;

        display: flex;
        align-content: center;
        justify-content: center;

        cursor: pointer;
    }

    .arrow_btn {
        border: 1px solid #ccc;
        border-radius: 50%;
        max-width: 34px;
    }

    .today_btn {
        margin-left: 8px;
        border: 1px solid #ccc;
    }

    .today_btn, .layout_btn {
        padding: 8px;
    }

    .control__btn:hover {
        background-color: rgba(238, 238, 238, 0.75);
    }

    .control__btn:hover:disabled {
        background-color: transparent;
    }

    @media screen and (max-width: 400px) {
        .calendar {
            padding: 8px;
            width: 100%;
        }

        .header {
            padding: 8px;
            flex-direction: column;
        }

        .header__content {
            margin: 0 8px 8px 8px;
        }

        .controls {
            margin-bottom: 8px;
        }
    }
</style>
