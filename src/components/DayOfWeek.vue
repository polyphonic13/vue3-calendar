<template>
    <div
        class="day"
    >
        <div
            v-for="(time, t) in TIMES_IN_DAY"
            :key="t"
            class="time_slot"
        >
            <!-- <div class="time_slot__selection_column"></div> -->
            <div class="half_hours">
                <div
                    class="half_hour"
                    :class="{ 'time_slot--selecting': props.isSelecting && ((selectedItems.includes(t) && (selectedItems[0] !== t || (selectedItems[0] === t && !isStartOnSecondHalf)) && (props.currentInitiator === -1 || props.currentInitiator === props.index))) }"
                    @mousedown="onMouseDown(t, false)"
                    @mouseover="onMouseOver(t, true)"
                    @mouseup="onMouseUp(t)"
                    @touchstart="onMouseDown(t, false)"
                    @touchmove="onMouseOver(t, true)"
                    @touchend="onMouseUp(t)"
                >
                    <div v-if="props.isIncludeTimeLabel" class="time_label">{{ time }}</div>
                </div>
                <div
                    class="half_hour second_half_hour"
                    :class="{ 'time_slot--selecting': props.isSelecting && ((selectedItems.includes(t) && (selectedItems[selectedItems.length - 1] !== t || (selectedItems[selectedItems.length - 1] === t && !isEndOnFirstHalf)) && (props.currentInitiator === -1 || props.currentInitiator === props.index))) }"
                    @mousedown="onMouseDown(t, true)"
                    @mouseover="onMouseOver(t, false)"
                    @mouseup="onMouseUp(t)"
                    @touchstart="onMouseDown(t, false)"
                    @touchmove="onMouseOver(t, true)"
                    @touchend="onMouseUp(t)"
                ></div>
            </div>
            <div class="event_cards">
                <div
                    v-for="(event, e) in formattedEvents"
                    :key="event.id"
                    role="button"
                    class="event_card"
                    :style="`height: ${event.height}%; top: ${event.top}%;`"
                    @click="onEventClicked(e)"
                >
                    <div class="event_card__title"><b>{{ event.title }}</b></div>
                    <div class="event_card__times">{{ convertNumberToTimeString(event.times.start) }} - {{ convertNumberToTimeString(event.times.end) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    import type { IEvent } from '@/interfaces';

    import { useEventStore } from '@/stores/events';
    import { TIMES_IN_DAY, useDateUtils } from '@/composables/use-date-utils';

    const {
        viewEvent,
    } = useEventStore();

    const { convertNumberToTimeString, getIsTimeWithinRange } = useDateUtils();

    interface IDayOfWeekProps {
        index: number;
        dayName: string;
        isIncludeTimeLabel: boolean;
        isSelecting: boolean;
        isStartOnSecondHalf: boolean;
        isEndOnFirstHalf: boolean;
        selectedItems: number[];
        currentInitiator?: number;
        events: IEvent[];
    }

    const props = defineProps<IDayOfWeekProps>();

    const emit = defineEmits([
        'timeOnMouseDown',
        'timeOnMouseOver',
        'timeOnMouseOut',
        'timeOnMouseUp'
    ]);

    const classes = computed(() => {

    });

    interface IFormattedEvent extends IEvent {
        height: number;
        top: number;
    }

    const formattedEvents = computed(() => {
        let count;
        let offset;

        const formatted: IFormattedEvent[] = props.events.map((event: IEvent, e: number) => {
            count = 0;
            offset = 0;
            const neighbors = props.events.reduce((count: number, evt: IEvent) => {
                if (event.id !== evt.id && getIsTimeWithinRange(event.times, evt.times)) {
                    count++
                };
                return count;
            }, count);

            const height = (100/48) * ((event.times.end - event.times.start) * 2);
            const top = (100/48) * (event.times.start * 2);
            // console.log(`neighbors for ${event.times.start}/${event.times.end} = ${neighbors}, left = ${left}`);

            offset = (count === 0) ? 0 : offset + 1;

            return {
                ...event,
                height,
                top,
            };
        });


        return formatted;
    });

    const onMouseDown = (index: number, isSecondHalf: boolean) => {
        emit('timeOnMouseDown', index, props.index, isSecondHalf);
    };

    const onMouseOver = (index: number, isSecondHalf: boolean) => {
        emit('timeOnMouseOver', index, isSecondHalf);
    };

    const onMouseUp = (index: number) => {
        emit('timeOnMouseUp', index);
    };

    const onEventClicked = (index: number) => {
        if (index > props.events.length) {
            console.warn(`ERROR: can no edit non-existent event with index ${index}`);
            return;
        }
        console.log(`DayOfWeek/onEventClicked, index = ${index}\nevent = ${JSON.stringify(props.events[index])}`);
        viewEvent(props.events[index]);
    };
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';
    @import '../styles/mixins.scss';

    .day {
        width: 100%;
        height: 100%;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        border-right: 1px solid $border-color01;
        border-bottom: 1px solid $border-color01;

        position: relative;

        cursor: pointer;
    }

    .header {
        padding: 8px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;


        font-size: 1.5em;
        text-align: center;
        user-select: none;
    }

    .time_slot {
        width: 100%;
        min-height: 56px;
        max-height: 56px;

        box-sizing: border-box;
        border-bottom: 1px solid #eee;

        display: flex;
        align-items: center;
    }

    .time_slot--selecting {
        @include selected_item;
    }

    .time_slot__selection_column {
        background: #ffeeff;
        min-width: 10%;
        flex: 1;
        height: 100%;
    }

    .time_label {
        min-width: 38px;
        // margin-left: -10px;

        // transform: rotate(-90deg);

        font-size: 0.75em;
        color: $secondary-bg03;
        user-select: none;
    }


    .half_hours {
        // background-color: aqua;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;

        position: relative;
    }

    .half_hour {
        width: 100%;
        height: 50%;

        display: flex;
        flex-direction: column;
        justify-content: center;

        padding-left: 4px;
        box-sizing: border-box;

        position: absolute;

        z-index: 1;
    }

    .second_half_hour {
        border-top: 1px #eee dotted;

        top: 50%;
    }

    .event_cards {
        @include event_cards;
    }

    .event_card {
        border-radius: 8px;

        @include event_card;
    }

    .event_card:hover {
        @include event_card--hover;
    }

    .day_name {
        font-size: 0.66em;
        margin-bottom: 4px;
    }

    .day_button {
        @include circle_button;
    }

    .day_button:hover {
        $primary-bg01-hover: #eee;
    }

    .current {
        background-color: $highlighted-color-primary;
    }

    .current:hover {
        background-color: $highlighted-color-primary-hover;

    }

    .inactive {
        color: $secondary-bg02;
        background-color: rgba(238, 238, 238, 0.5);
    }

    @media screen and (max-width: 400px) {
        .time_label {
            margin-left: -12px;

            font-size: 0.75em;
        }

        .day_button {
            min-width: 24px;
            min-height: 24px;

            padding: 4px;

            font-size: 0.5em;
        }

        .event_cards {
            @include event_cards--mobile;
        }

        .event_card {
            @include event_card--mobile;
        }
    }
</style>
