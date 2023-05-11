<template>
    <div
        class="day"
    >
        <div
            v-for="(time, t) in TIMES_IN_DAY"
            :key="t"
            class="time_slot"
            :class="{ time_slot__selecting: (selectedItems.includes(t) && (props.currentInitiator === -1 || props.currentInitiator === props.index)) }"
            @mousedown="onMouseDown(t)"
            @mouseover="onMouseOver(t)"
            @mouseup="onMouseUp(t)"
        >
            <div v-if="props.isIncludeTimeLabel" class="time_label">{{ time }}</div>
            <div class="time_slot__selection_column"></div>
            <div class="events"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { TIMES_IN_DAY } from '@/composables/use-date-utils';

    interface IDayOfWeekProps {
        index: number;
        dayName: string;
        isIncludeTimeLabel: boolean;
        isSelecting: boolean;
        selectedItems: number[];
        currentInitiator?: number;
    }

    const props = defineProps<IDayOfWeekProps>();

    const emit = defineEmits([
        'timeOnMouseDown',
        'timeOnMouseOver',
        'timeOnMouseOut',
        'timeOnMouseUp'
    ]);

    const onMouseDown = (index: number) => {
        emit('timeOnMouseDown', index, props.index);
    };

    const onMouseOver = (index: number) => {
        if (!props.isSelecting) {
            return;
        }
        emit('timeOnMouseOver', index);
    };

    const onMouseUp = (index: number) => {
        if (!props.isSelecting) {
            return;
        }
        emit('timeOnMouseUp', index);
    };
</script>

<style scoped lang="scss">
    @import '../styles/mixins.scss';

    .day {
        width: 100%;
        height: 100%;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        border-right: 1px #ccc solid;
        border-bottom: 1px #ccc solid;

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

        /* padding: 4px; */
        box-sizing: border-box;
        border-bottom: 1px solid #eee;

        display: flex;
        align-items: center;
    }

    .time_slot__selecting {
        @include selected-item;
    }

    .time_slot__selection_column {
        width: 32px;
        height: 100%;
    }

    .time_label {
        min-width: 38px;
        margin-left: -10px;

        transform: rotate(-90deg);

        font-size: 1em;
        color: #777;
        user-select: none;
    }

    @media screen and (max-width: 400px) {
        .time_label {
            margin-left: -12px;

            font-size: 0.75em;
        }
    }

    .events {
        min-height: 48px;

        flex: 1;
    }

    .day_name {
        font-size: 0.66em;
        margin-bottom: 4px;
    }

    .day_button {
        min-width: 32px;
        min-height: 32px;

        padding: 8px;
        box-sizing: border-box;

        border-radius: 50%;
        border: none;
        background-color: transparent;

        font-size: 1em;
        cursor: pointer;
    }

    @media screen and (max-width: 400px) {
        .day_button {
            min-width: 24px;
            min-height: 24px;

            padding: 4px;

            font-size: 0.5em;
        }
    }
    .day_button:hover {
        background-color: #eee;
    }

    .current {
        /* background-color: rgba(242, 250, 250, 0.75); */
        /* background-color: #123456; */
        background-color: #d9eafb;
        /* color: #fff; */
    }

    .current:hover {
        /* background-color: #345678; */
        background-color: #abcdef;

    }

    .inactive {
        color: #444;
        background-color: rgba(238, 238, 238, 0.5);
    }

</style>
