<template>
    <div ref="roolEl" class="repeat_event_settings">
        <button
            class="repeat_event_settings__value list__btn"
            :disabled="!isEnabled"
            ref="listBtnEl"
            @click="toggleListVisible"
            @keydown.stop="onKeyDown"
        >
            <span>{{ valueString }}</span>
            <svg v-if="isEnabled" xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 24 24" width="15px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 10l5 5 5-5z"/></svg>
        </button>
        <div v-if="isListOpen" class="repeat_event_settings__list">
            <button
                v-for="(type, t) in repititionTypes"
                :key="t"
                class="repitition_type__btn"
                @click="onRepeatingTypeClicked(t)"
            >{{ type }}</button>
        </div>

    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted, ref, computed } from 'vue';

    import type { IEvent } from '@/interfaces';
    import { RepeatEventType } from '@/enum/RepeatEventType';

    import { useRepeatingEventSettings } from '@/composables/use-repeating-event-settings';
    import { useSelectorComponent } from '@/composables/use-selector-component';
    import { useDateUtils } from '@/composables/use-date-utils';

    interface IRepeatingEventSettingsProps {
        event: Partial<IEvent>;
        isEnabled: boolean;
    }

    const props = defineProps<IRepeatingEventSettingsProps>();

    const { getRepetitionTypes, getRepeatingValueString } = useRepeatingEventSettings();

    const {
        isListOpen,
        setElements,
        toggleListVisible,
        onKeyDown,
        removeDocumentListener,
    } = useSelectorComponent();

    const { getWeekIndexOfMonthForDay } = useDateUtils();

    const roolEl = ref<HTMLElement | null>(null);
    const listBtnEl = ref<HTMLElement | null>(null);

    const isCustomModalShown = ref(false);

    const REPEAT_TYPES = [
        RepeatEventType.NONE,
        RepeatEventType.DAILY,
        RepeatEventType.WEEKLY,
        RepeatEventType.MONTHLY_DATE,
        RepeatEventType.MONTHLY_WEEKDAY,
        RepeatEventType.YEARLY,
    ];

    const valueString = computed(() => {
        return getRepeatingValueString(props.event as IEvent);
    });

    const repititionTypes = computed(() => {
        if (!props.event || !props.event.start) {
            return [];
        }

        return getRepetitionTypes(props.event.start);
    });

    const onRepeatingTypeClicked = (index: number) => {
        if (index >= REPEAT_TYPES.length) {
            isCustomModalShown.value = true;
            return;
        }

        props.event.repeatType = REPEAT_TYPES[index];
        toggleListVisible();

        if (props.event.repeatType !== RepeatEventType.MONTHLY_WEEKDAY) {
            return;
        }

        if (!props.event.start) {
            console.warn(`WARNING: can not set repeat value with event start date`);
            return;
        }

        props.event.repeatValue = getWeekIndexOfMonthForDay(props.event.start);
        console.log(`repeatValue = ${props.event.repeatValue}`);

    };

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

    .repeat_event_settings {
        width: 230px;

        display: flex;
        flex-direction: column;

        position: relative;
    }

    .repeat_event_settings__list {
        @include selector_list;

        width: 256px;
        top: 46px;
    }

    .repeat_event_settings__value, .calendar_name_list__btn {
        min-width: 256px;
        max-width: 256px;
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

    .repitition_type__btn {
        @include list_btn;

        border: none;

        text-align: left;
    }

    .repitition_type__btn:hover {
        @include list_btn--hover;
    }
</style>
