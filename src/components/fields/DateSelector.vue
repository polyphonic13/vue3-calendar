<template>
    <div class="date_selector">

    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref } from 'vue';
    import { useCalendarStore } from '@/stores/calendar';
    import { MONTH_NAMES } from '@/composables/use-date-utils';

    const { getMonthForYear } = useCalendarStore();

    interface IDateSelectorProps {
        startingYear: number;
        startingMonth: number;
    }

    const props = defineProps<IDateSelectorProps>();

    const emit = defineEmits(['dateSelected']);

    const year = ref(0);
    const month = ref(0);

    const focusedMonth = computed(() => {
        return getMonthForYear(year.value, month.value);
    });

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

    const onDateSelected = (index: number) => {
        const date = focusedMonth.value.days[index];
        emit('dateSelected', date);
    };

    onMounted(() => {
        year.value = props.startingYear;
        month.value = props.startingMonth;
    })
</script>

<style scoped lang="scss">
    @import "../../styles/global.scss";

    .day_selector {
        width: 378px;
        height: 378px;

        background-color: $primaryBg01;

        box-shadow: $boxShadow01;

        position: absolute;
        z-index: 10000;
    }
</style>
