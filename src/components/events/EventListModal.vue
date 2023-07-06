<template>
    <div
        v-if="focusedDay"
        ref="eventListModal"
        class="event_list_modal"
        :style="styles"
        @keydown.stop="onKeyDown"
    >
        <div class="event_list_modal__header">
            <div class="event_list_modal__header__date">
                <div class="month">{{ MONTH_NAMES[focusedDay.date.getMonth()] }}</div>
                <div class="day">{{ focusedDay.date.getDate() }}</div>
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
                v-for="(event, e) in focusedDay.events"
                :key="event.id"
                class="event_list_modal__event_btn"
                @click="onEventClicked(e)"
            >
                <span class="event_dot" :class="{ [`${event.calendarName}_event_calendar`]: true }"></span>
                <span class="event_card__title">{{ event.title }}</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, onUnmounted, ref } from 'vue';

    import { useEventStore } from '@/stores/events';

    import { useEventListModal } from '@/composables/use-event-list-modal';
    import { useViewEvent } from '@/composables/use-view-event';
    import { useDocumentClickListener } from '@/composables/use-document-click-listener';
    import { MONTH_NAMES } from '@/composables/use-date-utils';

    const { addDocumentClickListener, removeDocumentClickListener } = useDocumentClickListener();

    const eventListModal = ref<HTMLElement | null>(null);
    const closeButton = ref<HTMLElement | null>(null);

    const { getModalCoordinates, closeEventList } = useEventListModal();

    const { getFocusedDay } = useEventStore();

    const { viewEvent } = useViewEvent();

    const styles = computed(() => {
        const { x, y } = getModalCoordinates(eventListModal.value);

        return `top: ${y}px; left: ${x}px;`;
    });

    const focusedDay = computed(() => {
        return getFocusedDay();
    });

    const onEventClicked = (index: number) => {
        closeEventList();
        viewEvent(focusedDay.value!.events[index]);
    };

    const onCloseClicked = (_: MouseEvent | TouchEvent) => {
        closeEventList();
    };

    const onKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        if (key !== 'escape') {
            return;
        }

        closeEventList();
    }

    const onDocumentClicked = (event: MouseEvent | TouchEvent) => {
        if (!eventListModal.value || !event.target) {
            return;
        }

        const isChild = eventListModal.value.contains(event.target as Node);

        if (isChild) {
            return;
        }

        closeEventList();
    };

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
    @import '../../styles/global.scss';
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

        width: 100%;

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

    .event_card__title {
        @include event_card__title;

        padding: 2px 0 0 2px;
    }


</style>
