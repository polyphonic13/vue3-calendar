import { storeToRefs } from 'pinia';

import type { IBox, ICoordinates } from '@/interfaces';

import { useUIStore } from '@/stores/ui';
import { useEventStore } from '@/stores/events';

import { usePositionElementInWindow } from '@/composables/use-position-element-in-window';

export function useEventListModal() {
    const MODAL_PADDING = 16 as const;

    const uiStore = useUIStore();
    const { uiState } = storeToRefs(uiStore);

    const { setFocusedDay } = useEventStore();

    const { positionByMouseCoords } = usePositionElementInWindow();

    const viewEventList = (payload: { date: Date, coords: ICoordinates, win: IBox }) => {
        const { date, coords, win } = payload;

        setFocusedDay(date);

        uiState.value.currentClickCoords = coords;
        uiState.value.currentWindowDimensions = win;
        uiState.value.isEventListVisible = true;
    };

    const getModalCoordinates = (target: HTMLElement | null) => {
        const mouse = uiState.value.currentClickCoords;

        if (target === null) {
            return { ...mouse };
        }

        const win = uiState.value.currentWindowDimensions;
        return positionByMouseCoords(mouse, win, target, MODAL_PADDING);
    }

    const getIsEventListVisible = () => {
        return uiState.value.isEventListVisible;
    }

    const closeEventList = () => {
        uiState.value.isEventListVisible = false;
    };

    return {
        viewEventList,
        getIsEventListVisible,
        getModalCoordinates,
        closeEventList,
    };
}
