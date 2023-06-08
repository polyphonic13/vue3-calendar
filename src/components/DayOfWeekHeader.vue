<template>
    <div
        class="day_of_week_header"
    >
            <span v-if="props.dayName !== ''" class="day_name">{{ props.dayName }}</span>
            <button
                class="day_btn"
                :class="classes"
                @click.stop="$emit('dateClicked', props.index)"
            >{{ props.day }}</button>
    </div>
</template>

<script setup lang="ts">
    import { reactive, watch } from 'vue';

    interface IDayOfWeekHeaderProps {
        index: number;
        year: number;
        month: number;
        day: number;
        dayName?: string;
    }

    const props = defineProps<IDayOfWeekHeaderProps>();

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

</script>

<style scoped lang="scss">
    @import '../styles/global.scss';
    @import '../styles/mixins.scss';

    .day_of_week_header {
        width: 100%;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        text-align: center;
        user-select: none;

        border-top: 1px solid $borderColor01;

        cursor: pointer;
    }

    .day_name {
        margin-bottom: 4px;
    }

    .day_btn {
        @include circle_button;
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

    .current {
        background-color: $highlightedColorPrimary;
    }

    .current:hover {
        background-color: $highlightedColorPrimaryHover;
    }

    @media screen and (max-width: 400px) {
        .day_of_week_header {
            width: calc(100% / 7);

            font-size: 0.75em
        }

        .day_btn {
            @include circle_button--mobile;
        }
    }

</style>
