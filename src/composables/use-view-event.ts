import { storeToRefs } from 'pinia';

import type { IEvent } from '@/interfaces';

import { useEventStore } from '@/stores/events';
import { useUIStore } from '@/stores/ui';


export function useViewEvent() {
    const { setFocusedEvent } = useEventStore();

    const uiStore = useUIStore();
    const { uiState } = storeToRefs(uiStore);

    const viewEvent = (event: Partial<IEvent>) => {
        setFocusedEvent(event);
        uiState.value.isViewingEvent = true;
    };

    return {
        viewEvent,
    };
};
