import { ref } from 'vue';
import { defineStore } from 'pinia';

import { useLocalStorage } from '@/composables/use-local-storage';

const LOCAL_STORAGE_KEY = 'calendarAppUIData';

const { load, save } = useLocalStorage();

import type {
    IUIState,
} from '@/interfaces';

export const useUIStore = defineStore('ui', () => {
    const createState = (): IUIState => {
        const savedState = load<IUIState>(LOCAL_STORAGE_KEY);

        return {
            isControlCenterCollapsed: false,
            isViewingEvent: false,
            isViewingEventList: false,
            ...savedState,
        };
    };

    const uiState = ref<IUIState>(createState());

    const saveState = () => {
        save<IUIState>(LOCAL_STORAGE_KEY, uiState.value);
    };

    const toggleisControlCenterCollapsed = () => {
        uiState.value.isControlCenterCollapsed = !uiState.value.isControlCenterCollapsed;
        saveState();
    }

    return {
        uiState,
        toggleisControlCenterCollapsed,
    };
});
