<template>
    <div
        class="weekly_event_cards"
        :class="eventCardsClasses"
        :style="eventCardsStyle"
    >
        <div
            v-if="isEventCardsControlsVisible"
            class="event_card_list__controls"
        >
            <button class="event_card_list__controls__toggle_btn" @click="onToggleEventCardsExpandedClicked">
                <svg v-if="isEventCardsExpanded" class="up_arrow" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>
                <svg v-else class="down_arrow" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
            </button>
        </div>
        <div
            v-for="(_, d) in DAYS_OF_WEEK"
            :key="d"
            class="day_selection_area"
            :class="{ 'day--selecting': isSelectingDays && selectedItems.includes(d) }"
            @mousedown="emit('onDayMouseDown', d)"
            @mouseover="emit('onDayMouseOver', d)"
            @mouseup="emit('onDayMouseUp')"
            @touchstart="emit('onDayMouseDown', d)"
            @touchmove="emit('onDayMouseOver', d)"
            @touchend="emit('onDayMouseUp')"
        ></div>
        <button
            v-for="(event, e) in events"
            :key="event.id"
            class="event_card"
            :class="getCardClasses(event)"
            :style="getCardStyle(event, e)"
            @click.stop="onEventClicked(e)"
        >
            <span v-if="event.isHourly" class="event_card--hourly__dot"></span>
            <span class="event_card__title"><b>{{ event.title }}</b></span>
            <span v-if="event.isHourly" class="event_card--hourly__time">{{  convertDateToHHMM(event.start) }}</span>
        </button>

    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';

    import type {
        IEvent,
    } from '@/interfaces';
    import { MouseSelectionType } from '@/enum/MouseSelectionType';

    import { useEventStore } from '@/stores/events';

    import { useCalculateEventCardRows } from '@/composables/use-calculate-event-card-rows';
    import { DAYS_OF_WEEK, useDateUtils } from '@/composables/use-date-utils';

    interface IMultiDayEvent extends IEvent {
        daysWithinWeek: number;
        leftMultiplier: number;
        isHourly: boolean;
    }

    interface IWeeklyEventCardsProps {
        dailyEvents: IEvent[];
        hourlyEvents: IEvent[];
        weekDates: Date[];
        isSelecting: boolean;
        selectedItems: number[];
        currentType: string;
    }

    const props = defineProps<IWeeklyEventCardsProps>();

    const emit = defineEmits([
        'onDayMouseDown',
        'onDayMouseOver',
        'onDayMouseUp',
    ]);

    const { convertDateToHHMM } = useDateUtils();

    const { getRowsForEvents } = useCalculateEventCardRows();
    const { getDaysInEventInDateRangeCount, viewEvent } = useEventStore();

    const isCardsExpanded = ref(false);

    const isSelectingDays = computed(() => {
        return props.isSelecting && props.currentType === MouseSelectionType.DAILY;
    });

    const eventRows = computed(() => {
        return getRowsForEvents(events.value, props.weekDates);
    });

    const events = computed(() => {
        const daily = props.dailyEvents.map((event) => {
            const daysWithinWeek = getDaysInEventInDateRangeCount(event, props.weekDates[0], props.weekDates[props.weekDates.length -1]);
            let leftMultiplier = props.weekDates.findIndex((date) => date.getDate() === event.start.getDate());
            if (leftMultiplier === -1) {
                leftMultiplier = 0;
            }

            return {
                ...event,
                daysWithinWeek,
                leftMultiplier,
                isHourly: false,
            };
        });

        const hourly = props.hourlyEvents.map((event) => {
            let leftMultiplier = props.weekDates.findIndex((date) => date.getDate() === event.start.getDate());
            if (leftMultiplier === -1) {
                leftMultiplier = 0;
            }

            return {
                ...event,
                daysWithinWeek: 1,
                leftMultiplier,
                isHourly: true,
            };
        });

        return [...daily, ...hourly];
    });

    const isEventCardsControlsVisible = computed(() => {
        return [...eventRows.value].sort((a, b) => b - a)[0] > 2;
    });

    const isEventCardsExpanded = computed(() => {
        return isCardsExpanded.value;
    });

    const eventCardsClasses = computed(() => ({
        'event_card_list--expanded': (isCardsExpanded.value)
    }));

    const eventCardsStyle = computed(() => {
        const sorted = [...eventRows.value].sort((a, b) => b - a);
        return (isEventCardsExpanded.value) ? `height: ${(((sorted[0] + 1) * 24) + 28)}px` : 'height: 96px';
    });

    const getCardStyle = (event: IMultiDayEvent, index: number) => {
        const width = (100 / 7) * event.daysWithinWeek;
        // add extra 24 to include white space at top for new event creation area
        const top = ((eventRows.value[index]) * 24) + 24;
        const left = (100 / 7) * event.leftMultiplier;

        return `width: ${width}%; top: ${top}px; left: ${left}%`;
    };

    const getCardClasses = (event: IMultiDayEvent) => {
        return {
            'event_card--whole': (event.dayCount <= event.daysWithinWeek && (event.start.getHours() === 0 && event.end.getHours() === 0)),
            'event_card--left': (event.dayCount > event.daysWithinWeek && event.leftMultiplier > 0 && (event.start.getHours() === 0 && event.end.getHours() === 0)),
            'event_card--right': (event.dayCount > event.daysWithinWeek && event.leftMultiplier < 1 && event.daysWithinWeek < 7 && (event.start.getHours() === 0 && event.end.getHours() === 0)),
            'event_card--hourly': (event.start.getHours() !== 0 && event.end.getHours() !== 0),
        };
    };

    const onEventClicked = (index: number) => {
        if (index > events.value.length) {
            console.warn(`ERROR: can not edit non-existent event with index ${index}`);
            return;
        }

        viewEvent(events.value[index]);
    };

    const onToggleEventCardsExpandedClicked = () => {
        isCardsExpanded.value = !isCardsExpanded.value;
    };



</script>

<style scoped lang="scss">
    @import '../../styles/global.scss';
    @import '../../styles/mixins.scss';

    .weekly_event_cards {
        @include event_card_list;

        border-right: 1px solid $borderColor01;
    }

    .event_card_list {
        @include event_card_list;

        border-right: 1px solid $borderColor01;
    }

    .event_card_list--expanded {
        @include event_card_list--expanded;
    }

    .event_card_list__controls {
        bottom: 4px;
        left: 4px;
        position: absolute;
    }

    .event_card_list__controls__toggle_btn {
        @include circle_button;

        z-index: 1000;
    }

    .event_card_list__controls__toggle_btn:hover {
        @include circle_button--hover;
    }

    .event_card {
        @include event_card;

        height: 24px;

        left: 0;
        position: absolute;
    }

    .event_card--hourly {
        @include event_card--hourly;
    }

    .event_card--hourly__dot {
        @include event_card--hourly__dot;
    }

    .event_card--whole {
        @include event_card--rounded;
    }

    .event_card--left {
        @include event_card--rounded_left;
    }

    .event_card--right {
        @include event_card--rounded_right;
    }

    .event_card:hover {
        @include event_card--hover;
    }

    .event_card--hourly:hover {
        @include event_card--hourly--hover;
    }

    .event_card__title {
        @include event_card__title;

        padding: 2px 0 0 2px;
    }

    .day_selection_area {
        width: calc(100% / 7);
        height: 100%;

    }

    .day--selecting {
        @include selected_item;
    }

    @media screen and (max-width: 400px) {
        .event_card--hourly__dot, .event_card--hourly__time {
            display: none;
        }
    }
</style>
