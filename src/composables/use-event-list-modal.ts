import { storeToRefs } from 'pinia';

import type { ICoordinates } from '@/interfaces';

import { useUIStore } from '@/stores/ui';
import { useEventStore } from '@/stores/events';

export function useEventListModal() {

    const uiStore = useUIStore();
    const { uiState } = storeToRefs(uiStore);

    const { setFocusedDay } = useEventStore();

    const viewEventList = (payload: { date: Date, coords: ICoordinates }) => {
        const { date, coords } = payload;

        setFocusedDay(date);

        uiState.value.currentClickCoords = coords;
        uiState.value.isViewingEventList = true;
    };

    const getCurrentClickCoordinates = () => {
        return uiState.value.currentClickCoords;
    };

    const getIsViewEventList = () => {
        return uiState.value.isViewingEventList;
    }

    const closeEventList = () => {
        uiState.value.isViewingEventList = false;
    };

    return {
        viewEventList,
        getCurrentClickCoordinates,
        getIsViewEventList,
        closeEventList,
    };
}
