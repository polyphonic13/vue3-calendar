<template>
    <div
        class="event_modal"
    >
        <div class="event_modal__header">
            <span></span>
            <button
                v-if="!props.isNew && !isEditing"
                class="circle_button edit_button"
                ref="editButton"
                @click="onEditClicked"
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button
                v-if="!props.isNew"
                class="circle_button delete_button"
                @click="onDeleteClicked"
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
            <button
                class="circle_button close_button"
                @click="onCloseClicked"
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        </div>
        <div class="event_modal__content">
            <input
                ref="titleInput"
                class="event__title"
                type="text"
                placeholder="Add Title"
                :disabled="isEditingDisabled"
                v-model="props.event!.title"
                @keydown.stop="onTitleInputKeydown"
            />
            <div class="event__date_and_time">
                <div>
                    <button class="date_selector__btn" :class="dateSelectorBtnClasses">{{ startDateString }}</button>
                    <span v-if="!isSameDayEvent"> - </span>
                    <button
                        v-if="!isSameDayEvent"
                        class="date_selector__btn"
                        :class="dateSelectorBtnClasses"
                    >{{ endDateString }}</button>
                </div>
                <span v-if="!isFullDayEvent">{{ convertNumberToTimeString(props.event!.start!.time) }} - {{ convertNumberToTimeString(props.event!.end!.time) }}</span>
            </div>
            <textarea
                class="event__description"
                rows="5"
                placeholder="Description"
                :disabled="isEditingDisabled"
                v-model="props.event!.description"
                @keydown.stop
            />
        </div>
        <div class="event_model__footer">
            <span></span>
            <button
                class="save_button"
                :disabled="isSaveDisabled"
                @click="onSaveClicked"
            >SAVE</button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, nextTick } from 'vue';

    import type { IEvent } from '@/interfaces';
    import { useEventStore } from '@/stores/events';
    import { useDateUtils } from '@/composables/use-date-utils';

    const { convertNumberToTimeString, convertYMDToDateString } = useDateUtils();

    interface IEventModalProps {
        event?: Partial<IEvent> | null;
        isNew: boolean;
    }

    const eventStore = useEventStore();

    const {
        addEvent,
        viewEvent,
        updateEvent,
        deleteEvent,
        getIsFullDayEvent,
        getIsSameDayEvent,
    } = eventStore;

    const emit = defineEmits(['onClose']);

    const isEditing = ref(false);
    const titleInput = ref<HTMLElement | null>(null);
    const editButton = ref<HTMLElement | null>(null);

    const props = defineProps<IEventModalProps>();

    const isEditingDisabled = computed(() => {
        return !isEditing.value && !props.isNew;
    });

    const startDateString = computed(() => {
        if (!props.event || !props.event.start) {
            return '';
        }
        return convertYMDToDateString(props.event.start);
    });

    const endDateString = computed(() => {
        if (!props.event || !props.event.end) {
            return '';
        }
        return convertYMDToDateString(props.event.end);
    });

    const isSameDayEvent = computed(() => {
        return getIsSameDayEvent();
    });

    const isFullDayEvent = computed(() => {
        return getIsFullDayEvent();
    });

    const isSaveDisabled = computed(() => {
        return !props.event || !props.event.title || props.event.title === '';
    });

    const dateSelectorBtnClasses = computed(() => ({
        'date_selector__btn--enabled': (!isEditingDisabled.value),
    }));

    const onEditClicked = (event: MouseEvent) => {
        event.stopPropagation();

        if (isEditing.value || !props.event) {
            return;
        }

        viewEvent(props.event);
        isEditing.value = true;

        focusTitleInput();
    };

    const onDeleteClicked = () => {
        deleteEvent();
    };

    const onSaveClicked = () => {
        save();
    };

    const onCloseClicked = () => {
        close();
    };

    const onTitleInputKeydown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        if (key !== 'enter' && key !== 'return' && key !== 'escape' && key !== 'delete') {
            return;
        }

        if (key === 'delete') {
            deleteEvent();
            return;
        }

        if (key !== 'escape') {
            save();
            return;
        }

        close();
    };

    const close = () => {
        // console.log(`close, isEditingDisabled = ${isEditingDisabled.value}`);
        if (isEditingDisabled.value) {
            emit('onClose');
            return;
        }

        // const isConfirmed = confirm('Discard unsaved changes?');

        // if (!isConfirmed) {
        //     return;
        // }
        emit('onClose');
    };

    const save = () => {
        const method = (isEditing.value) ? updateEvent : addEvent;

        method();
        emit('onClose');
    };

    const focusTitleInput = async () => {
        if (!titleInput.value) {
            return;
        }

        await nextTick();

        titleInput.value.focus();

    };

    const focusEditButton = async () => {
        if (!editButton.value) {
            return;
        }

        await nextTick();

        editButton.value.focus();
    }

    onMounted(() => {
        if (!props.isNew) {
            focusEditButton();
            return;
        }
        focusTitleInput();
    });
</script>

<style lang="scss">
    @import '../styles/global.scss';
    @import '../styles/variables.scss';
    @import '../styles/mixins.scss';

    .event_modal {
        width: 500px;
        height: 500px;

        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;

        background-color: $greyscale01;
        box-shadow: $box-shadow03;

        padding: 8px;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        position: absolute;
        z-index: 1000;
    }

    .event_modal__header, .event_modal__content, .event_model__footer {
        width: 100%;

        padding: 8px;
        box-sizing: border-box;

        display: flex;
    }

    .event_modal__header, .event_model__footer {

        > :first-child {
            flex-grow: 1;
        }
    }

    .event_modal__content {
        flex-grow: 1;
        flex-direction: column;

        > * {
            padding: 8px 0;
            margin-bottom: 16px;
        }
    }

    .event__title {
        font-size: 1.5em;

        padding: 8px;

        background-color: $transparentGrey01;
        border: none;
        border-bottom: 1px solid $borderColor01;
        outline: none;
    }

    .event__title:disabled {
        background-color: transparent;
        border: none;
    }

    .event__date_and_time {
        display: flex;
        justify-content: space-between;
    }

    .event__description {

        font-family: $mainFont;

        padding: 8px;
    }

    .event__description:disabled {
        background-color: transparent;
        border: none;
    }

    .circle_button  {
        @include circle_button;
    }

    .circle_button:hover {
        @include circle_button--hover;
    }

    .save_button {
        @include text_button;
        @include text_button--primary;
    }

    .save_button:hover {
        @include text_button--hover;
    }

    .save_button:disabled {
        @include text_button--disabled;
    }

    .date_selector__btn {
        background-color: transparent;

        padding: 4px 8px;
        border: none;
        box-sizing: border-box;

        cursor: pointer;
    }

    .date_selector__btn--enabled {
        background-color: $transparentGrey02;
        border-bottom: 1px solid $borderColor01;
    }

    @media screen and (max-width: 400px) {
        .event_modal {
            width: 90%;
            height: 90%;
        }
    }
</style>
