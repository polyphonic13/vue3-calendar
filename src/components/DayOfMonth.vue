<template>
    <div
        class="day"
        :class="classes"
    >
        <div class="day__header">
            <button
                class="day_btn"
                :class="dayButtonClasses"
                @click="$emit('dateClicked')"
            >{{ props.day }}</button>
        </div>
        <div
            class="day__container"
            @mousedown="onMouseDown"
            @mouseover="onMouseOver"
            @mouseup="onMouseUp"
        >
            <div class="items"></div>
            <div class="new_item"></div>
        </div>
</div>
</template>

<script setup lang="ts">
    import { reactive, watch, computed, onMounted } from 'vue';

    interface IDayProps {
        index: number;
        year: number;
        month: number;
        currentMonth: number;
        day: number;
        date: Date;
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

    watch(() => props.isSelecting, () => {
        if (props.isSelecting) {
            return;
        }
    });

    watch(() => props.month, () => {
        console.log(`DayOfMonth, month change, month = ${props.month}, currentMonth = ${props.currentMonth}`);
    });

    const dayButtonClasses = reactive({
        'day_btn--current': getIsToday(),
    });

    const classes = computed(() => ({
        day__other_month: (props.month !== props.currentMonth),
        day__selecting: props.isSelected,
    }));

    const onMouseDown = (event: MouseEvent) => {
        emit('dayOnMouseDown', props.index);
    };

    const onMouseOver = (event: MouseEvent) => {
        if (!props.isSelecting) {
            return;
        }
        emit('dayOnMouseOver', props.index);
    };

    const onMouseUp = (event: MouseEvent) => {
        if (!props.isSelecting) {
            return;
        }
        emit('dayOnMouseUp', props.index);
    };
</script>

<style scoped lang="scss">
    @import '../styles/global.scss';
    @import '../styles/mixins.scss';

    .day {
        width: calc(100% / 7);

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        background-color: $primaryBg01;

        border-right: 1px solid $borderColor01;
        border-bottom: 1px solid $borderColor01;

        cursor: pointer;
    }

    .day__other_month {
        background-color: $inactiveBg01;
    }

    .day__selecting {
        > .day__container {
            > .new_item {
                @include selected_item;
            }
        }

    }

    .day__header {
        padding: 4px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;


        text-align: center;
        user-select: none;
    }

    .day__container {
        flex: 1;
    }

    .day_btn {
        @include circle_button;

        font-size: 1.5em;
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

    @media screen and (max-width: 400px) {
        .day_btn {
            @include circle_button--mobile;
        }
    }

    .new_item {
        margin: 4px 0 4px 0;
        width: 100%;
        height: 16px;
        box-sizing: border-box;
    }

</style>
