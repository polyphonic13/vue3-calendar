<template>
    <div
        class="weekly_event_cards"
        :class="classes"
    >
        <div
            v-for="(date, d) in weekDates"
            class="weekly_event_cards__day"
        >
            <button
                v-if="getEventsForDate(date).length > 2"
                class="more_events_btn"
                @click="onViewEventListClicked($event, props.weekDates[d])"
            >{{ `${getEventsForDate(date).length - 2} more` }}</button>
        </div>
        <button
            v-for="(event, e) in events"
            :key="event.id"
            class="event_card"
            :class="getCardClasses(event)"
            :style="getCardStyle(event, e)"
            @click.stop="onEventClicked(e)"
        >
            <span v-if="event.isHourly" class="event_dot"></span>
            <span class="event_card__title"><b>{{ event.title }}</b></span>
            <span v-if="event.isHourly" class="event_card--hourly__time">{{ convertDateToHHMM(event.start) }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted } from 'vue';

    import type {
        IEvent,
    } from '@/interfaces';

    import { useEventStore } from '@/stores/events';

    import { useCalculateEventCardRows } from '@/composables/use-calculate-event-card-rows';
    import { useDateUtils } from '@/composables/use-date-utils';
    import { useViewEvent } from '@/composables/use-view-event';
    import { usePointerEventProps } from '@/composables/use-pointer-event-props';

    interface IMultiDayEvent extends IEvent {
        daysWithinWeek: number;
        leftMultiplier: number;
        isHourly: boolean;
    }

    interface IWeeklyEventCardsProps {
        index: number;
        weekDates: Date[];
        isIncludeHourlyEvents: boolean;
    }

    const props = defineProps<IWeeklyEventCardsProps>();

    const emit = defineEmits([
        'onDayMouseDown',
        'onDayMouseOver',
        'onDayMouseUp',
        'viewEventListClicked',
    ]);

    const { convertDateToHHMM } = useDateUtils();

    const { getRowsForEvents } = useCalculateEventCardRows();

    const {
        getEventsForRange,
        getEventsForDate,
        getIsFullDayEvent,
        getDaysInEventInDateRangeCount,
     } = useEventStore();

    const { viewEvent } = useViewEvent();

    const { getCoordsFromEvent } = usePointerEventProps();

    const eventRows = computed(() => {
        return getRowsForEvents(events.value, props.weekDates);
    });

    const weeklyEvents = computed(() => getEventsForRange(props.weekDates[0], props.weekDates[props.weekDates.length - 1]));

    const fullDayEvents = computed(() => weeklyEvents.value.filter((event) => getIsFullDayEvent(event)));

    const hourlyEvents = computed(() => weeklyEvents.value.filter((event) => !getIsFullDayEvent(event)));

    const events = computed(() => {
        const daily = fullDayEvents.value.map((event) => {
            const daysWithinWeek = getDaysInEventInDateRangeCount(event, props.weekDates[0], props.weekDates[props.weekDates.length - 1]);
            let leftMultiplier = props.weekDates.findIndex(date => date.getDate() === event.start.getDate());

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

        if (!props.isIncludeHourlyEvents) {
            return daily;
        }

        const hourly = hourlyEvents.value.map((event) => {
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

    const classes = computed(() => ({
        'weekly_event_cards--tall': ([...eventRows.value].sort((a, b) => b - a)[0] > 1),
    }));

    const getCardStyle = (event: IMultiDayEvent, index: number) => {
        if (eventRows.value[index] > 1) {
            return 'display: none';
        }
        const width = (100 / 7) * event.daysWithinWeek;
        const top = ((eventRows.value[index]) * 24);
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

    const onViewEventListClicked = (event: MouseEvent, date: Date) => {
        const coords = getCoordsFromEvent(event);
        const payload = {
            date,
            coords,
        };

        // have to use set-timeout to give existing event list time to close
        setTimeout(() => {
            emit('viewEventListClicked', payload);
        }, 30);
    };

    onMounted(() => {
        // console.log(`WeeklyEventCards/onMounted, events = `, events.value);
    });
</script>

<style scoped lang="scss">
    @import '../../styles/global.scss';
    @import '../../styles/mixins.scss';

    .weekly_event_cards {
        @include event_card_list;
    }

    .weekly_event_cards__day {
        width: calc(100% / 7);

        border-right: 1px solid $borderColor01;
        box-sizing: border-box;
    }

    .more_events_btn {
        @include link_btn;

        padding-top: 54px;
    }

    .weekly_event_cards {
        min-height: 48px;
        max-height: 48px;
    }

    .weekly_event_cards--tall {
        min-height: 72px;
        max-height: 72px;
    }

    .event_card_list__controls {
        bottom: 4px;
        left: 4px;
        position: absolute;
    }

    .event_card_list__controls__toggle_btn {
        @include circle_button;

        background-color: $greyscale01;
        border: 1px solid $greyscale02;
        box-shadow: $boxShadow04;

        bottom: 2px;
        left: 2px;

        position: absolute;
        z-index: 1000;
    }

    .event_card_list__controls__toggle_btn:hover {
        // @include circle_button--hover;
        // opacity: 0.7;
        background-color: $transparentGrey05;
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

    .event_dot {
        @include event_dot;
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

        z-index: 1001;
    }

    .event_card--hourly:hover {
        @include event_card--hourly--hover;
    }

    .event_card__title {
        @include event_card__title;

        padding: 2px 0 0 2px;
    }

    @media screen and (max-width: 400px) {
        .event_dot, .event_card--hourly__time {
            display: none;
        }
    }
</style>
