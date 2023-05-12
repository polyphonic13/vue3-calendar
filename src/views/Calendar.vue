<template>
    <div v-if="state" class="calendar">
        <div class="header">
            <div class="header__content">
                <span class="title">{{ headerTitle }}</span>
                <span v-if="state.layout === CalendarLayout.WEEK && state.monthInfo">WEEK {{ state.monthInfo.weeks[state.week].weekNumber }}</span>
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
            :month="state.month"
            :month-info="state.monthInfo"
            @date-clicked="onDateClicked"
            @add-event="onAddEvent"
        />
        <WeekLayout
            v-if="state.layout === CalendarLayout.WEEK && state.monthInfo && !isUpdating"
            :year="state.year"
            :month="state.month"
            :index="state.week"
            :week-info="state.monthInfo.weeks[state.week]"
            @date-clicked="onDateClicked"
            @add-event="onAddEvent"
        />
        <DayLayout
            v-if="state.layout === CalendarLayout.DAY && state.monthInfo && !isUpdating"
            :year="state.year"
            :day-info="state.monthInfo.weeks[state.week].days[state.day]"
            @add-event="onAddEvent"
        />
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted } from 'vue';
    import { storeToRefs } from 'pinia';

    import { CalendarLayout } from '../enum/CalendarLayout';

    import { useCalendarStore } from '@/stores/calendar';
    import { MONTH_NAMES, useDateUtils } from '@/composables/use-date-utils';

    import type {
        IDayInfo,
        IEvent,
    } from '../interfaces';

    import MonthLayout from '@/components/MonthLayout.vue';
    import WeekLayout from '@/components/WeekLayout.vue';
    import DayLayout from '@/components/DayLayout.vue';
    import LayoutSelector from '@/components/LayoutSelector.vue';

    interface ICalendarProps {
        layout?: CalendarLayout,
        year?: number,
        month?: number,
    }

    const props = defineProps<ICalendarProps>();

    const store = useCalendarStore();
    const { state } = storeToRefs(store);
    console.log(`calendar being defined, state = `, state, `\nstore.state = `, store.state);
    const { setLayout, setInfoToToday } = store;

    const { getMonthInfo } = useDateUtils();

    let isUpdating = false;

    onMounted(() => {
        console.log(`Calendar/onMounted, props = ${JSON.stringify(props)}\nstate = `, state);

        if (!state) {
            return;
        }
        updateMonthInfo();
        const todayIndices = state.value.monthInfo.todayIndices;
        state.value.week = todayIndices.week;
        state.value.day = todayIndices.day;
    });

    const headerTitle = computed(() => {
        if (!state) {
            return '';
        }

        if (state.value.layout !== CalendarLayout.WEEK) {
            return `${MONTH_NAMES[state.value.month]} ${state.value.year}`;
        }

        const weekInfo = state.value.monthInfo.weeks[state.value.week];
        const monthIndices: number[] = [];

        weekInfo.days.forEach((day: IDayInfo) => {
            if (monthIndices.indexOf(day.month) === -1) {
                monthIndices.push(day.month);
            }
        });

        const months = monthIndices.map((index) => MONTH_NAMES[index]);

        return `${months.join(' - ')} ${state.value.year}`;
    });

    const updateMonthInfo = () => {
        if (!state) {
            return;
        }
        state.value.monthInfo = getMonthInfo(state.value.year, state.value.month);
        // console.log(`get month info: `, state.value.monthInfo);
        isUpdating = false;
    };

    const updateMonth = () => {
        const monthOfCurrentDay = state.value.monthInfo.weeks[state.value.week].days[state.value.day].month
        if (monthOfCurrentDay === state.value.month) {
            return;
        }
        // the month changed during an increment/decrement, request new month info
        const previousIndex = state.value.month;
        state.value.month = monthOfCurrentDay;
        updateMonthInfo();
        state.value.week = (previousIndex > monthOfCurrentDay) ? state.value.monthInfo.weeks.length - 1 : 0;
    };

    const updateMonthInfoToToday = () => {
        setInfoToToday();
    }

    const updateWeekAndDayIndices = (indices: { week: number, day: number }) => {
        if (!state.value.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        const { week, day } = indices;

        state.value.week = week;
        state.value.day = day;

        isUpdating = false;
    };

    const incrementMonth = () => {
        isUpdating = true;

        state.value.week = 0;
        state.value.day = 0;
        // console.log(`incrementMonth`)
        if (state.value.month < MONTH_NAMES.length - 1) {
            // console.log(`\tthere are still month months in the year...`);
            state.value.month++;
            updateMonthInfo();
            return;
        }

        // console.log(`\treached last month, incrementing to next year`);
        state.value.year++;
        state.value.month = 0;
        updateMonthInfo();
    };

    const decrementMonth = () => {
        isUpdating = true;

        state.value.day = 0;

        if (state.value.month > 0) {
            state.value.month--;
            updateMonthInfo();
            isUpdating = false;
            return;
        }

        state.value.year--;
        state.value.month = MONTH_NAMES.length - 1;
        updateMonthInfo();

        isUpdating = false;
    };

    const incrementWeek = () => {
        if (!state.value.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        state.value.day = 0;

        if (state.value.week < state.value.monthInfo.weeks.length - 1) {
            state.value.week++;
            isUpdating = false;
            return;
        }
        // console.log(`week at last entry, going to increment month`);
        incrementMonth();
    };

    const decrementWeek = () => {
        if (!state.value.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        state.value.day = 0;

        if (state.value.week > 0) {
            state.value.week--;
            isUpdating = false;
            return;
        }

        decrementMonth();
        state.value.week = state.value.monthInfo.weeks.length - 2;
    };

    const incrementDay = () => {
        if (!state.value.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        if (state.value.day < 6) {
            state.value.day++;
            updateMonth();
            isUpdating = false;
            // console.log(`incremented day, day now = ${state.value.day}`);
            return;
        }

        if (state.value.week < state.value.monthInfo.weeks.length - 1) {
            state.value.week++;
            state.value.day = 0;
            // console.log(`incremented week, week & day indices now = ${state.value.week}, ${state.value.day}`);
            updateMonth();
            isUpdating = false;
            return;
        }

        state.value.month = (state.value.month < MONTH_NAMES.length - 1) ? state.value.month + 1 : 0;
        state.value.day = 0;
        state.value.week = 0;
        // console.log(`updated month, focused month now = ${state.value.month}`);

        if (state.value.month === 0) {
            state.value.year++;
            // console.log(`incremented year`);
        }

        updateMonthInfo();
        state.value.week = 0;
        state.value.day = 0;

        isUpdating = false;
    };

    const decrementDay = () => {
        if (!state.value.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;

        if (state.value.day > 0) {
            state.value.day--;
            // console.log(`decremented day, day now = ${state.value.day}`);
            updateMonth();
            isUpdating = false;
            return;
        }

        if (state.value.week > 0) {
            state.value.week--;
            state.value.day = state.value.monthInfo.weeks[state.value.week].days.length - 1;
            // console.log(`decremented week, week & day indices now = ${state.value.week}, ${state.value.day}`);
            updateMonth();
            isUpdating = false;
            return;
        }

        state.value.month = (state.value.month > 0) ? state.value.month - 1 : MONTH_NAMES.length - 1;
        // console.log(`updated month, focused month now = ${state.value.month}`);

        if (state.value.month === MONTH_NAMES.length - 1) {
            state.value.year--;
            // console.log(`decremented year`);
        }

        // console.log(`week & day indices now = ${state.value.week}, ${state.value.day}`)
        updateMonthInfo();
        state.value.week = state.value.monthInfo.weeks.length - 1;
        state.value.day = state.value.monthInfo.weeks[state.value.week].days.length - 1;

        isUpdating = false;
    };

    const DECREMENT_METHODS = {
        [CalendarLayout.YEAR]: () => {},
        [CalendarLayout.MONTH]: decrementMonth,
        [CalendarLayout.WEEK]: decrementWeek,
        [CalendarLayout.DAY]: decrementDay,
    };

    const onPrevClicked = () => {
        if (!DECREMENT_METHODS[state.value.layout]) {
            return;
        }
        DECREMENT_METHODS[state.value.layout]();
    };

    const INCREMENT_METHODS = {
        [CalendarLayout.YEAR]: () => {},
        [CalendarLayout.MONTH]: incrementMonth,
        [CalendarLayout.WEEK]: incrementWeek,
        [CalendarLayout.DAY]: incrementDay,
    };

    const onNextClicked = () => {
        if (!INCREMENT_METHODS[state.value.layout]) {
            return;
        }
        INCREMENT_METHODS[state.value.layout]();
    };

    const onTodayClicked = () => {
        if (!state.value.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        isUpdating = true;
        updateMonthInfoToToday();

        const { month, week, day } = state.value.monthInfo.todayIndices;
        if (month === -1 || week === -1 || day === -1) {
            console.warn(`WARNING: today indices returned month ${month} week ${week}, day ${day}`);
            return
        }

        state.value.year = new Date().getFullYear();
        state.value.month = month;
        state.value.week = week
        state.value.day = day;

        isUpdating = false;
    };

    const onDayLayoutClicked = () => {
        if (!state.value.monthInfo) {
            console.warn(`WARNING: no month data available`);
            return;
        }

        if (state.value.layout === CalendarLayout.DAY) {
            return;
        }
        isUpdating = true;

        setLayout(CalendarLayout.DAY);

        const { month, week, day } = state.value.monthInfo.todayIndices;

        if (month === -1 || week === -1 || day === -1) {
            const day = state.value.monthInfo.weeks[0].days.findIndex(day => day.month === state.value.month);
            updateWeekAndDayIndices({ week: 0, day: day });
            return;
        }

        updateWeekAndDayIndices({ week, day });
    };

    const onWeekLayoutClicked = () => {
        if (state.value.layout === CalendarLayout.WEEK) {
            return;
        }
        setLayout(CalendarLayout.WEEK);
    };

    const onMonthLayoutClicked = () => {
        if (state.value.layout === CalendarLayout.MONTH) {
            return;
        }
        setLayout(CalendarLayout.MONTH);
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

        if (state.value.layout === CalendarLayout.DAY) {
            return;
        }

        isUpdating = true;

        updateWeekAndDayIndices(indices);

        setLayout(CalendarLayout.DAY);
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
