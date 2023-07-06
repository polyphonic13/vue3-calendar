import { ref } from 'vue';

export function useSelectorComponent() {
    const isListOpen = ref(false);

    const root = ref<HTMLElement | null>(null);
    const listBtn = ref<HTMLElement | null>(null);
    
    const setElements = (rootEl: HTMLElement, listBtnEl: HTMLElement) => {
        root.value = rootEl;
        listBtn.value = listBtnEl;
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

        if (!listBtn.value) {
            return;
        }

        listBtn.value.blur();
    };

    const onDocumentClicked = (event: MouseEvent) => {
        if (!isListOpen.value) {
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

        isListOpen.value = false;
    };

    const addDocumentListener = () => {
        document.addEventListener('click',event => onDocumentClicked(event));
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
