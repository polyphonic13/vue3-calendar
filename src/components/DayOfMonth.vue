<template>
    <div
        class="day"
        :class="classes"
    >
        <div class="day__header">
            <button
                class="day_button"
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
        dayButtonClasses.current = getIsToday();
    });

    watch(() => props.isSelecting, () => {
        if (props.isSelecting) {
            return;
        }
    });

    const dayButtonClasses = reactive({
        current: getIsToday(),
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
    @import '../styles/mixins.scss';

    .day {
        width: calc(100% / 7);

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        border-right: 1px #ccc solid;
        border-bottom: 1px #ccc solid;

        cursor: pointer;
    }

    .day__other_month {
        background-color: rgba(238, 238, 238, 0.66);
    }

    .day__selecting {
        > .day__container {
            > .new_item {
                @include selected-item;
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

    .day_button {
        min-width: 34px;
        max-width: 34px;
        min-height: 34px;
        max-height: 34px;

        padding: 7px;
        box-sizing: border-box;

        border-radius: 50%;
        border: none;
        background-color: transparent;

        font-size: 1.25em;
        cursor: pointer;
    }

    .new_item {
        margin: 4px 0 4px 0;
        width: 100%;
        height: 16px;
        box-sizing: border-box;
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
        background-color: #d9eafb;
    }

    .current:hover {
        background-color: #abcdef;

    }

</style>
