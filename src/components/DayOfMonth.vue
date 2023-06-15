<template>
    <div
        class="day_of_month"
        :class="classes"
        @mousedown="emit('dayOnMouseDown', props.index)"
        @mouseover="emit('dayOnMouseOver', props.index)"
        @mouseup="emit('dayOnMouseUp', props.index)"
        @touchstart="emit('dayOnMouseDown', props.index)"
        @touchmove="emit('dayOnMouseOver', props.index)"
        @touchend="emit('dayOnMouseUp', props.index)"
    >
        <div class="day_of_month__header">
            <button
                class="day_btn"
                :class="dayButtonClasses"
                @click="$emit('dateClicked')"
                @mousedown.stop=""
                @touchstart.stop=""
            >{{ props.day }}</button>
        </div>
        <div
            class="day_of_month__selection_area"
            :class="{ 'day_of_month__selection_area--selecting': props.isSelecting && props.isSelected }"
        ></div>
</div>
</template>

<script setup lang="ts">
    import { reactive, watch, computed } from 'vue';

    interface IDayProps {
        index: number;
        year: number;
        month: number;
        currentMonth: number;
        day: number;
        isSelecting: boolean;
        isSelected: boolean;
    }

    const props = defineProps<IDayProps>();

    const emit = defineEmits([
        'dayOnMouseDown',
        'dayOnMouseOver',
        'dayOnMouseOut',
        'dayOnMouseUp',
        'dateClicked',
    ]);

    const getIsToday = () => {
        const today = new Date();
        return props.year === today.getFullYear() && props.month === today.getMonth() && props.day === today.getDate();
    };

    watch(() => props.day, () => {
        dayButtonClasses['day_btn--current'] = getIsToday();
    });

    const dayButtonClasses = reactive({
        'day_btn--current': getIsToday(),
    });

    const classes = computed(() => ({
        day_of_month__other_month: (props.month !== props.currentMonth),
    }));
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';
    @import '../styles/mixins.scss';

    .day_of_month {
        width: calc(100% / 7);

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        background-color: $primaryBg01;

        border-right: 1px solid $borderColor01;
        border-top: 1px solid $borderColor01;

        cursor: pointer;
    }

    .day_of_month__other_month {
        > .day_of_month__header {
            > button {
                color: $inactiveColor01;
            }
        }
    }

    .day_of_month__header {
        padding: 4px;

        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

        text-align: center;
        user-select: none;
    }

    .day_btn {
        @include circle_button;

        font-size: 1.5em;
        line-height: 1em;
    }

    .day_btn:hover {
        @include circle_button--hover;
    }

    .day_btn--current {
        @include circle_button--current;
    }

    .day_btn--current:hover {
        @include circle_button--current--hover;
    }

    .day_of_month__selection_area {
        height: 24px;

        cursor: pointer;
    }

    .day_of_month__selection_area--selecting {
        @include selected_item;
    }

    @media screen and (max-width: 400px) {
        .day_btn {
            @include circle_button--mobile;
        }
    }

</style>
