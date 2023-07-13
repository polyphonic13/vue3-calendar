import { ref } from 'vue';

export function useSelectorComponent() {
    const isListOpen = ref(false);

    const roolEl = ref<HTMLElement | null>(null);
    const listBtnEl = ref<HTMLElement | null>(null);

    const setElements = (roolElEl: HTMLElement, listBtnElEl: HTMLElement) => {
        roolEl.value = roolElEl;
        listBtnEl.value = listBtnElEl;
    }
    const toggleListVisible = () => {
        isListOpen.value = !isListOpen.value;

        if (!isListOpen.value) {
            removeDocumentListener();
            return;
        }

        addDocumentListener();
    };

    const NAV_KEYS = ['tab', 'arrowdown', 'arrowup', 'enter', 'return'];

    const onKeyDown = (event: KeyboardEvent) => {
        if (!isListOpen.value) {
            return;
        }

        const key = event.key.toLowerCase();

        if (NAV_KEYS.includes(key)) {
            return;
        }

        isListOpen.value = false;

        if (!listBtnEl.value) {
            return;
        }

        listBtnEl.value.blur();
    };

    const onDocumentClicked = (event: MouseEvent) => {
        if (!isListOpen.value) {
            return;
        }

        if (!roolEl || !roolEl.value) {
            return;
        }

        if (!event.target) {
            return;
        }

        if (roolEl.value.contains(event.target as HTMLElement)) {
            return;
        }

        isListOpen.value = false;
    };

    const addDocumentListener = () => {
        document.addEventListener('click', event => onDocumentClicked(event));
    };

    const removeDocumentListener = () => {
        document.removeEventListener('click', event => onDocumentClicked(event));
    };


    return {
        isListOpen,
        setElements,
        toggleListVisible,
        onKeyDown,
        removeDocumentListener,
    };
}
