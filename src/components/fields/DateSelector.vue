<template>
    <div class="date_selector">
        <button
            class="date_selector__btn"
            :class="dateSelectorBtnClasses"
            @click="onDateSelectorBtnClicked"
        >{{ dateString }}</button>
        <div
            v-if="isModalOpen"
            class="date_selector__modal"
            @keydown.stop="onModalKeydown"
        >
            <div class="date_selector__modal__header">
                <div class="date_selector__modal__header__title">{{ modalHeaderString }}</div>
                <div class="date_selector__modal__header__controls">
                    <button
                        class="control__btn"
                        @click="onPreviousMonthClicked"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 24 24" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                    <button
                        class="control__btn"
                        @click="onNextMonthClicked"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 24 24" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </button>
                </div>
            </div>
            <div class="date_selector__modal__contents">
                <div
                    v-for="(day, d) in focusedMonth"
                    :key="d"
                    class="day_of_month"
                >
                    <button
                        class="day_of_month__btn"
                        :class="{ 'day_of_month__btn--other_month': (day.getMonth() !== month), 'day_of_month__btn--current': (day.getMonth() === value.month && day.getDate() === value.day && day.getFullYear() === value.year)}"
                        @click="onDateClicked(d)"
                    >{{ day.getDate() }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref, watch } from 'vue';

    import type { IYearMonthDay } from '@/interfaces';

    import { useCalendarStore } from '@/stores/calendar';

    import { MONTH_NAMES, useDateUtils } from '@/composables/use-date-utils';

    const { getMonthForYear, getWeeksForMonth } = useCalendarStore();
    const { convertYMDToDateString } = useDateUtils();

    interface IDateSelectorProps {
        isEditing: boolean;
        value: IYearMonthDay;
    }

    const props = defineProps<IDateSelectorProps>();

    const emit = defineEmits(['dateSelected']);

    const year = ref(0);
    const month = ref(0);
    const isModalOpen = ref(false);

    const dateSelectorBtnClasses = computed(() => ({
        'date_selector__btn--enabled': (props.isEditing),
    }));

    const dateString = computed(() => {
        return convertYMDToDateString(props.value);
    });

    const modalHeaderString = computed(() => {
        return `${MONTH_NAMES[month.value]} ${year.value}`;
    });

    const focusedMonth = computed(() => {
        return getMonthForYear(year.value, month.value);
    });

    const onDateSelectorBtnClicked = () => {
        if (isModalOpen.value || !props.isEditing) {
            return;
        }
        isModalOpen.value = true;
    };

    const onPreviousMonthClicked = () => {
        if (month.value > 0) {
            month.value--;
            return;
        }

        month.value = MONTH_NAMES.length - 1;
        year.value--;
    };

    const onNextMonthClicked = () => {
        if (month.value < MONTH_NAMES.length - 1) {
            month.value++;
            return;
        }

        month.value = 0;
        year.value++;
    };

    const onDateClicked = (index: number) => {
        isModalOpen.value = false;
        const date = focusedMonth.value[index];
        emit('dateSelected', date);
    };

    const onModalKeydown = (event: KeyboardEvent) => {
        if (event.key.toLowerCase() !== 'escape') {
            return;
        }
        isModalOpen.value = false;
    };

    watch(() => month.value, () => {
        // console.log(`getWeeksForMonth = `, getWeeksForMonth(month.value, year.value));
    });

    onMounted(() => {
        year.value = props.value.year;
        month.value = props.value.month;

        // console.log(`getWeeksForMonth = `, getWeeksForMonth(month.value, year.value));
    })
</script>

<style scoped lang="scss">
    @import "../../styles/global.scss";
    @import "../../styles/mixins.scss";

    .date_selector__btn {
        background-color: transparent;

        padding: 4px 8px;
        border: none;
        box-sizing: border-box;

        cursor: default;
    }

    .date_selector__btn--enabled {
        background-color: $transparentGrey02;
        border-bottom: 1px solid $borderColor01;
        cursor: pointer;
    }


    .date_selector__modal {
        width: 256px;
        height: 256px;

        background-color: $primaryBg01;

        box-shadow: $boxShadow01;

        display: flex;
        flex-direction: column;

        position: absolute;
        z-index: 10000;

        > * {
            width: 100%;
            padding: 8px;
        }
    }

    .date_selector__modal__header, .date_selector__modal__contents {
        width: 100%;
        padding: 8px;
        box-sizing: border-box;

        display: flex;
        align-items: center;
    }

    .date_selector__modal__header__title {
        flex-grow: 1;
        font-size: 1.25em;

        padding-left: 8px;
    }

    .date_selector__modal__header__controls {
        display: flex;
        justify-content: flex-end;
    }

    .control__btn {
        @include control__btn;

        margin: 0;
        font-size: 0.5em;
    }

    .date_selector__modal__contents {
        flex-wrap: wrap;
        flex-grow: 1;

    }

    .day_of_month {
        min-width: calc((100%)/ 7);
        max-width: calc((100%)/ 7);

        // max-height: calc(100% / 6);
        max-height: 34px;
        min-height: 32px;

    }

    .day_of_month__btn {
        @include circle_button;

        text-align: right;
    }

    .day_of_month__btn:hover {
        @include circle_button--hover;
    }

    .day_of_month__btn--current {
        @include circle_button--current;
    }

    .day_of_month__btn--current:hover {
        @include circle_button--current--hover;
    }


    .day_of_month__btn--other_month {
        color: $inactiveColor01;
    }
</style>