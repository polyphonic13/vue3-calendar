<template>
    <div
        class="event_modal"
    >
        <div class="event_modal__header">
            <span></span>
            <button
                v-if="!props.isNew"
                class="circle_button edit_button"
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
            />
            <div class="event__date_and_time">
                <span>{{ startDay }}</span>
                <span v-if="!isSameDay"> - {{ endDay }}</span>
                <span>{{ convertNumberToTimeString(props.event!.times!.start) }} - {{ convertNumberToTimeString(props.event!.times!.end) }}</span>
            </div>
            <textarea
                class="event__description"
                rows="5"
                placeholder="Description"
                :disabled="isEditingDisabled"
                v-model="props.event!.description"
            />
        </div>
        <div class="event_model__footer">
            <span></span>
            <button
                class="save_button"
                @click="onSaveClicked"
            >SAVE</button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, onMounted, nextTick } from 'vue';

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
        getisViewingEvent,
    } = eventStore;

    const emit = defineEmits(['onClose']);

    const isEditing = ref(false);
    const titleInput = ref<HTMLElement | null>(null);

    const props = defineProps<IEventModalProps>();

    watch(() => props.event, () => {
        console.log(`EventModal/watch event, event = ${JSON.stringify(props.event)}`);
    });

    const isEditingDisabled = computed(() => {
        return !isEditing.value && !props.isNew;
    });

    const startDay = computed(() => {
        if (!props.event || !props.event.year || !props.event.month || !props.event.dates) {
            return '';
        }
        return convertYMDToDateString(props.event.year, props.event.month, props.event.dates.start);
    });

    const endDay = computed(() => {
        if (!props.event || !props.event.year || !props.event.month || !props.event.dates) {
            return '';
        }
        return convertYMDToDateString(props.event.year, props.event.month, props.event.dates.end);
    });

    const isSameDay = computed(() => {
        if (!props.event || !props.event.dates || !props.event.dates.start || ! props.event.dates.end) {
            return true;
        }

        return props.event.dates.start === props.event.dates.end;
    });

    const isViewingEvent = computed(() => {
        return getisViewingEvent();
    });

    watch(() => isViewingEvent, () => {
        console.log(`isViewingEvent changed: ${isViewingEvent}`);
    });

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
        const method = (isEditing.value) ? updateEvent : addEvent;
        method();
        emit('onClose');
    };

    const onCloseClicked = () => {
        emit('onClose');
    };

    const focusTitleInput = async () => {
        if (!titleInput.value) {
            return;
        }

        await nextTick();

        titleInput.value.focus();

    };

    onMounted(() => {
        if (!props.isNew) {
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
            padding: 8px;
            margin-bottom: 16px;
        }
    }

    .event__title {
        font-size: 1.5em;

        border: none;
        border-bottom: 1px solid #ddd;
        outline: none;
    }

    .event__title:disabled {
        border: none;
    }

    .event__date_and_time {
        display: flex;
        justify-content: space-between;
    }

    .event__description {
        font-family: $mainFont;
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

    @media screen and (max-width: 400px) {
        .event_modal {
            width: 90%;
            height: 90%;
        }
    }
</style>
