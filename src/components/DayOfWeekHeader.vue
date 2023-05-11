<template>
    <div class="day">
        <div class="header">
            <span v-if="props.dayName !== ''" class="day_name">{{ props.dayName }}</span>
            <button
                class="day_button"
                :class="classes"
                @click="$emit('dateClicked')"
            >{{ props.day }}</button>
        </div>
        <div class="items"></div>
    </div>
</template>

<script setup lang="ts">
    import { reactive, watch } from 'vue';

    interface IDayOfWeekProps {
        year: number;
        month: number;
        day: number;
        dayName?: string;
    }

    const props = defineProps<IDayOfWeekProps>();

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
    .day {
        width: 100%;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        border-right: 1px #ccc solid;
        border-top: 1px #ccc solid;
        /* border-bottom: 1px #ccc solid; */

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
        min-height: 48px;
        max-height: 48px;

        padding: 4px;
        box-sizing: border-box;
        border-bottom: 1px solid #eee;

        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    .day_name {
        font-size: 0.66em;
        margin-bottom: 4px;
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
        background-color: #d9eafb;
    }

    .current:hover {
        background-color: #abcdef;

    }

    .items {
        min-height: 32px;
    }

</style>
