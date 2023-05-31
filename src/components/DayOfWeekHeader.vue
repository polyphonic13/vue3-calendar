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

    .day {
        width: 100%;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        // border-right: 1px solid $borderColor01;
        border-top: 1px solid $borderColor01;

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

    @media screen and (max-width: 400px) {
        .day_button {
            @include circle_button--mobile;
        }
    }

</style>
