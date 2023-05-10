<template>
    <div ref="root" class="layout_selector">
        <button
            class="list__btn"
            ref="listBtn"
            @click="onOpenListClicked"
            @keydown="onKeyDown"
        >
            <span>{{ props.layout.toUpperCase() }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 24 24" width="15px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 10l5 5 5-5z"/></svg>
        </button>
        <div
            v-if="state.isListOpen"
            class="layout_selector__list"

        >
            <button
                class="layout_selector__list_item layout__btn"
                :disabled="props.layout === CalendarType.DAY"
                @click="() => onLayoutBtnClicked(CalendarType.DAY)"
            >
                <span>DAY</span>
                <span>d</span>
            </button>
            <button
                class="layout_selector__list_item layout__btn"
                :disabled="props.layout === CalendarType.WEEK"
                @click="() => onLayoutBtnClicked(CalendarType.WEEK)"
            >
                <span>WEEK</span>
                <span>w</span>
            </button>
            <button
                class="layout_selector__list_item layout__btn"
                :disabled="props.layout === CalendarType.MONTH"
                @click="() => onLayoutBtnClicked(CalendarType.MONTH)"
            >
                <span>MONTH</span>
                <span>m</span>
            </button>
            <button
                class="layout_selector__list_item layout__btn"
                :disabled="props.layout === CalendarType.YEAR"
                @click="() => onLayoutBtnClicked(CalendarType.YEAR)"
            >
                <span>YEAR</span>
                <span>y</span>
            </button>

        </div>
    </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue';

import type { CalendarLayout } from '@/enum/CalendarLayout';

interface ILayoutSelectorProps {
    layout: CalendarLayout;
}

const props = defineProps<ILayoutSelectorProps>();

const emit = defineEmits(['layoutBtnClicked']);

const state = reactive({
    isListOpen: false,
});

const root = ref<HTMLElement | null>(null);
const listBtn = ref<HTMLElement | null>(null);

const LAYOUT_TYPES_FOR_KEY = new Map<string, CalendarType>(
    [
        ['m', CalendarType.MONTH],
        ['w', CalendarType.WEEK],
        ['d', CalendarType.DAY],
    ],
);

const updateLayout = (type: CalendarType) => {
    state.isListOpen = false;
    emit('layoutBtnClicked', type);
};

const onLayoutBtnClicked = (type: CalendarType) => {
    updateLayout(type);
};

const onOpenListClicked = () => {
    state.isListOpen = !state.isListOpen;

    if (!state.isListOpen) {
        removeDocumentListener();
        return;
    }

    addDocumentListener();
};

const onKeyDown = (event: KeyboardEvent) => {
    if (!state.isListOpen) {
        return;
    }

    const key = event.key.toLowerCase();

    if (key === 'escape') {
        state.isListOpen = false;
        return;
    }

    const type: CalendarType | undefined = LAYOUT_TYPES_FOR_KEY.get(key);

    if (!type) {
        return;
    }

    updateLayout(type);

    if (!listBtn.value) {
        return;
    }

    listBtn.value.blur();
};

const onDocumentClicked = (event: MouseEvent) => {
    if (!state.isListOpen) {
        return;
    }

    if (!root || !root.value) {
        return;
    }

    if (!event.target) {
        return;
    }

    if (root.value.contains(event.target as HTMLElement)) {
        return;
    }

    state.isListOpen = false;
};

const addDocumentListener = () => {
    document.addEventListener('click', (event) => onDocumentClicked(event));
};

const removeDocumentListener = () => {
    document.removeEventListener('click', (event) => onDocumentClicked(event));
};

onUnmounted(() => {
    removeDocumentListener();
});
</script>

<style lang="scss" scoped>
.layout_selector {
    width: 100%;
    min-width: 64px;

    height: 100%;

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;
}

.layout_selector__list {
    background-color: white;

    width: 224px;
    // height: 320px;
    top: 38px;
    right: 0;

    padding: 8px;
    box-sizing: border-box;

    /* offset-x | offset-y | blur-radius | spread-radius | color */
    box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);

    position: absolute;
    z-index: 100;

    display: flex;
    flex-direction: column;
}

.layout_selector__list_item {
    width: 100%;

    padding: 8px;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: space-between;
    // flex: 1;
}

.list__btn {
    min-width: 90px;
    background: none;

    padding: 8px;
    margin: 0 4px 0 4px;

    border: 1px solid #ccc;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: space-between;

    cursor: pointer;
}

.list__btn:hover {
    background-color: rgba(238, 238, 238, 0.75);
}

.list__btn:hover:disabled {
    background-color: transparent;
}

.layout__btn {
    background: #fff;
    border: transparent;

    text-align: left;

    cursor: pointer;
}

</style>
