<template>
    <div class="time_input" ref="timeInput">
        <input
            type="time"
            class="time_input__text_field"
            :class="classes"
            :disable="!isModalOpen"
            :value="inputFieldValue"
            ref="textField"
            @keydown.stop=""
            @blur="onTextFieldBlur"
        />
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';

    import { useDateUtils } from '@/composables/use-date-utils';

    const { convertDateToHHMM } = useDateUtils();

    interface ITimeInputProps {
        isEditing: boolean;
        value: Date;
    }

    const props = defineProps<ITimeInputProps>();

    const emit = defineEmits(['timeUpdated']);

    const timeInput = ref<HTMLElement | null>(null);
    const textField = ref<HTMLInputElement | null>(null);

    const isModalOpen = ref(false);

    const inputFieldValue = computed(() => {
        return convertDateToHHMM(props.value, false);
    });

    const classes = computed(() => ({
        'time_input__text_field--enabled': (props.isEditing),
    }));

    const onTextFieldBlur = (event: FocusEvent) => {
        const target = event.target as HTMLInputElement;

        emit('timeUpdated', target.value);
    };

</script>

<style scoped lang="scss">
    @import "../../styles/global.scss";
    @import "../../styles/mixins.scss";

    .time_input__text_field {
        max-width: 128px;
        min-height: 30px;

        background-color: transparent;

        padding: 4px 8px;
        border: none;
        box-sizing: border-box;

        cursor: default;
    }

    input[type="time"]::-webkit-calendar-picker-indicator {
        background: none;
        display:none;
    }

    .time_input__text_field--enabled {
        background-color: $transparentGrey02;
        border-bottom: 1px solid $borderColor01;
        cursor: pointer;
    }

    .time_input__text_field--enabled::-webkit-calendar-picker-indicator {
        background: default;
        display: block;
    }

</style>
