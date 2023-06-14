<template>
    <div class="event_list_modal" ref="eventListModal">
        <div class="event_list_modal__header">
            <span></span>
            <button
                class="circle_button close_button"
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
    import { nextTick, onMounted, onUnmounted, ref } from 'vue';

    import type { IEvent } from '@/interfaces';

    import { useViewEvent } from '@/composables/use-view-event';
    import { useDocumentClickListener } from '@/composables/use-document-click-listener';

    const { addDocumentClickListener, removeDocumentClickListener } = useDocumentClickListener();

    interface IEventListModalProps {
        events: IEvent[];
    }

    const props = defineProps<IEventListModalProps>();

    const emit = defineEmits(['onClose']);

    const eventListModal = ref<HTMLElement | null>(null);

    const { viewEvent } = useViewEvent();

    const onEventClicked = (index: number) => {
        close();
        viewEvent(props.events[index]);
    };

    const onCloseClicked = (_: MouseEvent | TouchEvent) => {
        close();
    };

    const onDocumentClicked = (event: MouseEvent | TouchEvent) => {
        if (!eventListModal.value || !event.target) {
            return;
        }

        console.log(`EventListModal/onDocumentCliked, eventListModal = `, eventListModal.value, `\n\tevent.target = `, event.target);
        const isChild = eventListModal.value.contains(event.target as Node);

        if (isChild) {
            return;
        }

        close();
    };

    const close = () => {
        console.log(`EventListModal/close`);
        emit('onClose');
    }

    onMounted(() => {
        console.log(`EventListModal/onMounted`);
        // have to use set time out as initial click on link to open gets registered by onDocumentClicked
        setTimeout(() => {
            addDocumentClickListener(onDocumentClicked);
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
        max-height: 128px;

        overflow: scroll;

        z-index: 999;
    }

    .event_list_modal__header {
        width: 100%;

        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .event_list_modal__event_btn {
        @include link_btn;

        display: flex;
        align-items: flex-start;

        > * {
            padding: 2px 4px;
        }
    }

    .event_dot {
        @include event_dot;
    }

    @media screen and (max-width: 400px) {
        .event_list_modal {
            width: 90%;
            height: 90%;
        }
    }
</style>
