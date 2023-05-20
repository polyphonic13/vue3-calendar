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

        if (savedState) {
            return savedState;
        }

        return {
            isControlCenterCollapsed: false,
        };
    };

    const state = ref<IUIState>(createState());

    const saveState = () => {
        save<IUIState>(LOCAL_STORAGE_KEY, state.value);
    };

    const toggleisControlCenterCollapsed = () => {
        state.value.isControlCenterCollapsed = !state.value.isControlCenterCollapsed;
        saveState();
    }

    return {
        state,
        toggleisControlCenterCollapsed,
    };
});
