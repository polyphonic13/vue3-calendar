<template>
    <div
        ref="eventListModal"
        class="event_list_modal"
        :style="styles"
        @keydown.stop="onKeyDown"
    >
        <div class="event_list_modal__header">
            <div class="event_list_modal__header__date">
                <div class="month">{{ MONTH_NAMES[props.date.getMonth()] }}</div>
                <div class="day">{{ props.date.getDate() }}</div>
            </div>
            <button
                class="circle_button close_button"
                ref="closeButton"
                @click="onCloseClicked"
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        </div>
        <div class="event_list_modal__content">
            <button
                v-for="(event, e) in props.events"
                :key="event.id"
                class="event_list_modal__event_btn"
                @click="onEventClicked(e)"
            >
                <span class="event_dot"></span>
                <span class="event_card__title">{{ event.title }}</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, onUnmounted, ref } from 'vue';

    import type { IEvent, ICoordinates } from '@/interfaces';

    import { MONTH_NAMES } from '@/composables/use-date-utils';

    import { useViewEvent } from '@/composables/use-view-event';
    import { useDocumentClickListener } from '@/composables/use-document-click-listener';
    import { usePositionElementInWindow } from '@/composables/use-position-element-in-window';

    const { addDocumentClickListener, removeDocumentClickListener } = useDocumentClickListener();
    const { getLocationWithinWindow } = usePositionElementInWindow();

    interface IEventListModalProps {
        events: IEvent[];
        coords: ICoordinates;
        date: Date;
    }

    const props = defineProps<IEventListModalProps>();

    const emit = defineEmits(['onClose']);

    const eventListModal = ref<HTMLElement | null>(null);
    const closeButton = ref<HTMLElement | null>(null);

    const { viewEvent } = useViewEvent();

    const styles = computed(() => {
        const { x, y } = getLocationWithinWindow(props.coords.x, props.coords.y, eventListModal.value, 16);

        return `top: ${y}px; left: ${x}px;`;
    });

    const onEventClicked = (index: number) => {
        close();
        viewEvent(props.events[index]);
    };

    const onCloseClicked = (_: MouseEvent | TouchEvent) => {
        close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        if (key !== 'escape') {
            return;
        }

        close();
    }

    const onDocumentClicked = (event: MouseEvent | TouchEvent) => {
        if (!eventListModal.value || !event.target) {
            return;
        }

        // console.log(`EventListModal/onDocumentCliked, eventListModal = `, eventListModal.value, `\n\tevent.target = `, event.target);
        const isChild = eventListModal.value.contains(event.target as Node);

        if (isChild) {
            return;
        }

        close();
    };

    const close = () => { emit('onClose'); };

    onMounted(() => {
        // have to use set time out as initial click on link to open gets registered by onDocumentClicked
        setTimeout(() => {
            addDocumentClickListener(onDocumentClicked);

            if (!closeButton.value) {
                return;
            }

            closeButton.value.focus();
        }, 0);
    });

    onUnmounted(() => {
        removeDocumentClickListener(onDocumentClicked);
    });
</script>

<style scoped lang="scss">
    @import '../../styles/mixins.scss';

    .event_list_modal {
        @include modal;

        width: 256px;

        padding-bottom: 32px;

        overflow: scroll;

        z-index: 999;
    }

    .event_list_modal__header {
        width: 100%;

        display: flex;
        align-items: flex-start;
        justify-content: space-between;

        > * {
            min-height: 100%;
        }
    }

    .left-span, .close_button {
        flex-basis: 34px;
    }

    .event_list_modal__header__date {
        flex-grow: 1;

        margin-left: 34px;

        padding-bottom: 8px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        > * {
            padding: 4px;
        }
    }

    .day {
        font-size: 1.5em;
    }

    .event_list_modal__event_btn {
        @include link_btn;

        display: flex;
        align-items: center;
        justify-self: flex-start;

        font-size: 1.25em;

        > * {
            padding: 2px 4px;
        }
    }

    .event_dot {
        @include event_dot;
    }
</style>
