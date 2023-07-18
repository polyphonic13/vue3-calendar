<template>
    <div class="date_selector" ref="dateSelector">
        <button
            class="date_selector__btn"
            :class="dateSelectorBtnClasses"
            @click="onDateSelectorBtnClicked"
        >{{ valueString }}</button>
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
                        :class="{ 'day_of_month__btn--other_month': (day.getTime() === props.value.getTime())}"
                        @click="onDateClicked(d)"
                    >{{ day.getDate() }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref } from 'vue';

    import { useCalendarStore } from '@/stores/calendar';

    import { MONTH_NAMES, useDateUtils } from '@/composables/use-date-utils';
    import { useDocumentClickListener } from '@/composables/use-document-click-listener';

    const { getMonthForYear } = useCalendarStore();

    const { addDocumentClickListener, removeDocumentClickListener } = useDocumentClickListener();

    interface IDateSelectorProps {
        isEditing: boolean;
        value: Date;
    }

    const { getDayMDFromDate } = useDateUtils();

    const props = defineProps<IDateSelectorProps>();

    const emit = defineEmits(['dateSelected']);

    const year = ref(0);
    const month = ref(0);
    const dateSelector = ref<HTMLElement | null>(null);

    const isModalOpen = ref(false);

    const valueString = computed(() => {
        if (!props.value || !(props.value instanceof Date)) {
            return '';
        }

        return getDayMDFromDate(props.value);
    });

    const dateSelectorBtnClasses = computed(() => ({
        'date_selector__btn--enabled': (props.isEditing),
    }));

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

        addDocumentClickListener(onDocumentClicked);
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

    const onDocumentClicked = (event: MouseEvent | TouchEvent) => {
        if (!dateSelector.value || !event.target) {
            return;
        }

        const isChild = dateSelector.value.contains(event.target as Node);

        if (isChild) {
            return;
        }
        isModalOpen.value = false;
        removeDocumentClickListener(onDocumentClicked);
    };

    onMounted(() => {
        console.log(`DateSelector/onMounted, value = `, props.value);
        year.value = props.value.getFullYear();
        month.value = props.value.getMonth();
    });
</script>

<style scoped lang="scss">
    @import "../../styles/global.scss";
    @import "../../styles/mixins.scss";

    .date_selector__btn {
        min-height: 30px;

        background-color: transparent;

        padding: 4px;
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
    }

    .date_selector__modal__header {
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
        align-content: flex-start;
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
