<template>
    <div ref="roolEl" class="calendar_name_selector">
        <button
            class="calendar_name_selector__value list__btn"
            :class="valueClassName"
            :disabled="!isEnabled"
            ref="listBtnEl"
            @click="toggleListVisible"
            @keydown.stop="onKeyDown"
        >
            <span v-if="props.value" class="event_dot" :class="{ [`${props.value}_event_calendar`]: true }"></span>
            <span class="calendar_name">{{ valueString }}</span>
            <div class="spacer"></div>
            <svg v-if="isEnabled" xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 24 24" width="15px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 10l5 5 5-5z"/></svg>

        </button>
        <div v-if="isListOpen" class="calendar_name_selector__list">
            <button
                v-for="(calendar, c) in props.calendars"
                :key="c"
                class="calendar_name_list__btn"
                :class="{ [`${calendar.name}_event_calendar`]: true, selected: calendar.name === props.value }"
                @click="onCalendarBtnClicked(c)"
            >{{ calendar.name }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted, ref, computed } from 'vue';

    import type { IEventCalendar } from '@/interfaces';

    import { useSelectorComponent } from '@/composables/use-selector-component';

    interface ICalendarNameSelectorProps {
        value?: string;
        calendars: IEventCalendar[];
        isEnabled: boolean;
    }

    const props = defineProps<ICalendarNameSelectorProps>();

    const {
        isListOpen,
        setElements,
        toggleListVisible,
        onKeyDown,
        removeDocumentListener,
    } = useSelectorComponent();

    const roolEl = ref<HTMLElement | null>(null);
    const listBtnEl = ref<HTMLElement | null>(null);

    const valueString = computed(() => {
        return (props.value) ? props.value : 'Select Calendar';
    });

    const valueClassName = computed(() => ({
        // [`${props.value}_event_calendar`]: true,
    }));

    const emit = defineEmits([
        'calendarNameClicked',
    ]);

    const onCalendarBtnClicked = (index: number) => {
        isListOpen.value = false;
        emit('calendarNameClicked', index);
    }

    onMounted(() => {
        if (!roolEl.value || !listBtnEl.value) {
            return;
        }
        setElements(roolEl.value, listBtnEl.value);
    });

    onUnmounted(() => {
        removeDocumentListener();
    });
</script>

<style scoped lang="scss">
    @import '../../styles/mixins.scss';
    @import '../../styles/global.scss';

    .calendar_name_selector {
        width: 150px;

        display: flex;
        flex-direction: column;

        position: relative;
    }

    .event_dot {
        @include event_dot;
    }

    .calendar_name {
        margin-left: 4px;
    }

    .calendar_name_selector__list {
        @include selector_list;

        width: 150px;
        top: 46px;
    }

    .calendar_name_selector__value, .calendar_name_list__btn {

        min-width: 150px;
        max-width: 150px;
    }

    .calendar_name_list__btn:hover {
        @include control__btn--hover;
    }

    .list__btn {
        @include list_btn;

        &:hover {
            @include list_btn--hover;
        }

        &:disabled {
            @include list_btn--disabled;
        }

        &:hover:disabled {
            @include list_btn--hover--disabled;
        }
    }

    .calendar_name_list__btn {
        @include calendar_name__btn;
        margin: 4px 0;
    }
</style>
