<template>
    <div
        class="day"
    >
        <div class="header">
            <span v-if="props.dayName !== ''" class="day_name">{{ props.dayName }}</span>
            <button
                class="day_button"
                :class="classes"
                @click.stop="$emit('dateClicked', props.index)"
            >{{ props.day }}</button>
        </div>
        <div
            class="event_cards"
            :class="{ 'day--selecting': isSelectingDays && props.selectedItems.includes(props.index) }"
            @mousedown="onMouseDown"
            @mouseover="onMouseOver"
            @mouseup="onMouseUp"

        >
            <div
                v-for="(event, e) in props.events"
                :key="event.id"
                class="event_card"
                :class="getEventCardClass(e)"
                @click.stop="onEventClicked(e)"
            >
                <div class="event_card__title">{{ event.title }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { reactive, watch, computed, onMounted } from 'vue';

    import type { IEvent } from '@/interfaces';
    import { MouseSelectionType } from '@/enum/MouseSelectionType';

    import { useEventStore } from '@/stores/events';

    const { viewEvent } = useEventStore();

    interface IDayOfWeekHeaderProps {
        index: number;
        year: number;
        month: number;
        day: number;
        dayName?: string;
        isSelecting: boolean;
        selectedItems: number[];
        currentInitiator?: number;
        currentType: string;
        events: IEvent[];
    }

    const props = defineProps<IDayOfWeekHeaderProps>();

    const emit = defineEmits([
        'dayOnMouseDown',
        'dayOnMouseOver',
        'dayOnMouseUp',
        'dateClicked',
    ]);

    const getIsToday = () => {
        const today = new Date();
        return props.year === today.getFullYear() && props.month === today.getMonth() && props.day === today.getDate();
    };

    watch(() => props.day, () => {
        classes.current = getIsToday();
    });

    watch(() => props.month, () => {
        classes.current = getIsToday();
    });

    const classes = reactive({
        current: getIsToday(),
    });

    const isSelectingDays = computed(() => {
        return props.isSelecting && props.currentType === MouseSelectionType.DAILY;
    });

    const getEventCardClass = (index: number) => {
        const dates = props.events[index].dates;

        if (dates.start === dates.end) {
            return {
                'event_card--rounded': true,
            };
        }

        if (props.events[index].dates.start === props.day) {
            return {
                'event_card--left': true,
            };
        }

        if (props.events[index].dates.end === props.day) {
            return {
                'event_card--right': true,
            };
        }
    };

    const onMouseDown = () => {
        emit('dayOnMouseDown', props.index);
    };

    const onMouseOver = () => {
        emit('dayOnMouseOver', props.index);
    };

    const onMouseUp = () => {
        emit('dayOnMouseUp', props.index);
    };

    const onEventClicked = (index: number) => {
        if (index > props.events.length) {
            console.warn(`ERROR: can not edit non-existent event with index ${index}`);
            return;
        }
        console.log(`DayOfWeekHeader/onEventClicked, index = ${index}\nevent = ${JSON.stringify(props.events[index])}`);
        viewEvent(props.events[index]);
    };

    // onMounted(() => {
    //     console.log(`DayOfWeekHeader[ ${props.index} ]/onMounted, events = `, props.events);
    // })
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';
    @import '../styles/mixins.scss';

    .day {
        width: 100%;
        // min-height: 128px;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        border-right: 1px solid $border-color01;
        border-top: 1px solid $border-color01;

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

    .day_name {
        font-size: 0.66em;
        margin-bottom: 4px;
    }

    .day_button {
        @include circle_button;
    }

    .day_button:hover {
        @include circle_button--hover;
    }

    .day_btn--current {
        @include circle_button--current;
    }

    .day_btn--current:hover {
        @include circle_button--current--hover;
    }

    .current {
        background-color: $highlighted-color-primary;
    }

    .current:hover {
        background-color: $highlighted-color-primary-hover;
    }

    .event_cards {
        min-height: 24px;

        display: flex;
        flex-direction: column;

        position: relative;
    }

    .day--selecting {
        @include selected_item;
    }

    .event_card {
        height: 24px;
        @include event_card;
    }

    // .event_card:hover {
    //     @include event_card--hover;
    // }

    .event_card--rounded {
        @include event_card--rounded;
    }

    .event_card--left {
        @include event_card--rounded_left;
    }

    .event_card--right {
        @include event_card--rounded_right;
    }

    .event_card__title {
        display: flex;
        align-content: center;
        justify-content: flex-start;
    }

    @media screen and (max-width: 400px) {
        .day_button {
            @include circle_button--mobile;
        }
    }

</style>
