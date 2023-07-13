<template>
    <div ref="roolEl" class="layout_selector">
        <button
            class="list__btn"
            ref="listBtnEl"
            @click="toggleListVisible"
            @keydown="onKeyDown"
        >
            <span>{{ valueString }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 24 24" width="15px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 10l5 5 5-5z"/></svg>
        </button>
        <div
            v-if="isListOpen"
            class="layout_selector__list"

        >
            <button
                class="layout_selector__list_item layout__btn"
                :disabled="props.layout === CalendarLayout.DAY"
                @click="() => onLayoutClicked(CalendarLayout.DAY)"
            >
                <span>DAY</span>
                <span>d</span>
            </button>
            <button
                class="layout_selector__list_item layout__btn"
                :disabled="props.layout === CalendarLayout.WEEK"
                @click="() => onLayoutClicked(CalendarLayout.WEEK)"
            >
                <span>WEEK</span>
                <span>w</span>
            </button>
            <button
                class="layout_selector__list_item layout__btn"
                :disabled="props.layout === CalendarLayout.MONTH"
                @click="() => onLayoutClicked(CalendarLayout.MONTH)"
            >
                <span>MONTH</span>
                <span>m</span>
            </button>
            <button
                class="layout_selector__list_item layout__btn"
                :disabled="props.layout === CalendarLayout.SCHEDULE"
                @click="() => onLayoutClicked(CalendarLayout.SCHEDULE)"
            >
                <span>SCHEDULE</span>
                <span>s</span>
            </button>

        </div>
    </div>
</template>

<script setup lang="ts">
    import {onMounted, onUnmounted, computed, ref } from 'vue';

    import { useSelectorComponent } from '@/composables/use-selector-component';

    import { CalendarLayout } from '@/enum/CalendarLayout';

    const roolEl = ref<HTMLElement | null>(null);
    const listBtnEl = ref<HTMLElement | null>(null);

    interface ILayoutSelectorProps {
        layout: CalendarLayout;
    }

    const props = defineProps<ILayoutSelectorProps>();

    const emit = defineEmits(['layoutBtnClicked']);

    const {
        isListOpen,
        setElements,
        toggleListVisible,
        onKeyDown,
        removeDocumentListener,
    } = useSelectorComponent();

    const valueString = computed(() => {
        return (props && props.layout) ? props.layout.toUpperCase() : '';
    });

    const updateLayout = (type: CalendarLayout) => {
        isListOpen.value = false;
        emit('layoutBtnClicked', type);
    };

    const onLayoutClicked = (type: CalendarLayout) => {
        updateLayout(type);
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
    @import '../../styles/global.scss';
    @import '../../styles/mixins.scss';

    .layout_selector {
        width: 100%;
        min-width: 128px;

        height: 100%;

        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .layout_selector__list {
        @include selector_list;

        width: 224px;
        top: 38px;

    }

    .layout_selector__list_item {
        width: 100%;

        padding: 8px;
        box-sizing: border-box;

        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .list__btn {
        @include list_btn;

        margin: 0 4px 0 4px;

        &:hover {
            @include list_btn--hover;
        }

        &:disabled {
            background: none;
        }

        &:hover:disabled {
            @include list_btn--hover--disabled;
        }
    }

    .layout__btn {
        background: $primaryBg01;
        border: transparent;

        text-align: left;

        cursor: pointer;

        &:hover {
            @include list_btn--hover;
        }
    }

</style>
