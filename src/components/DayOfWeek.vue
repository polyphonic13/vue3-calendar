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
                    :class="{ 'time_slot--selecting': (selectedItems.includes(t) && (selectedItems[0] !== t || (selectedItems[0] === t && !isStartOnSecondHalf)) && (props.currentInitiator === -1 || props.currentInitiator === props.index)) }"
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
                    :class="{ 'time_slot--selecting': (selectedItems.includes(t) && (selectedItems[selectedItems.length - 1] !== t || (selectedItems[selectedItems.length - 1] === t && !isEndOnFirstHalf)) && (props.currentInitiator === -1 || props.currentInitiator === props.index)) }"
                    @mousedown="onMouseDown(t, true)"
                    @mouseover="onMouseOver(t, false)"
                    @mouseup="onMouseUp(t)"
                    @touchstart="onMouseDown(t, false)"
                    @touchmove="onMouseOver(t, true)"
                    @touchend="onMouseUp(t)"
                ></div>
            </div>
            <div class="events">
                <div
                    v-for="(event, e) in events"
                    :key="event.id"
                    class="event"
                    :style="`width: ${(100/events.length)}%; height: ${((100/48) * ((event.times.end - event.times.start) * 2))}%; top: ${((100/48) * (event.times.start * 2))}%; left: ${(100/events.length) * e}%;`"
                >{{ event.times.start }} - {{  event.times.end }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, watch } from 'vue';

    import type { IEvent } from '@/interfaces';

    import { TIMES_IN_DAY } from '@/composables/use-date-utils';

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

    watch(() => props.events, () => {
        if (props.events.length === 0) {
            return;
        }
    });

    const onMouseDown = (index: number, isSecondHalf: boolean) => {
        emit('timeOnMouseDown', index, props.index, isSecondHalf);
    };

    const onMouseOver = (index: number, isSecondHalf: boolean) => {
        if (!props.isSelecting) {
            return;
        }
        emit('timeOnMouseOver', index, isSecondHalf);
    };

    const onMouseUp = (index: number) => {
        if (!props.isSelecting) {
            return;
        }
        emit('timeOnMouseUp', index);
    };

    onMounted(() => {
        console.log(`DayOfWeek/onMounted, events = `, props.events);
    });
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
    }

    .events {
        // background-color: #fedcba;

        top: 0;
        bottom: 0;
        left: 0;
        right: 16px;

        position: absolute;
    }

    .event {
        background-color: rgba(238, 238, 238, 0.5);

        width: 100%;

        border-radius: 8px;

        padding: 8px;
        box-sizing: border-box;

        position: absolute;
        z-index: 2;

        display: flex;
    }

    .day_name {
        font-size: 0.66em;
        margin-bottom: 4px;
    }

    .day_button {
        @include day_button;
        // @include flex_centered;
        // flex-direction: column;

        // min-width: 32px;
        // min-height: 32px;

        // padding: 8px;
        // box-sizing: border-box;

        // border-radius: 50%;
        // border: none;
        // background-color: transparent;

        // font-size: 1em;
        // cursor: pointer;
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
    }
</style>
