import { ref, reactive } from 'vue';

type UseMouseSelectState = {
    isSelecting: boolean,
    isStartOnSecondHalf: boolean,
    isEndOnFirstHalf: boolean,
    selectedItems: number[],
    currentInitiator: number,
};

export function useMouseItemSelect() {
    const startIndex = ref(-1);
    const endIndex = ref(-1);

    const flatIndices = ref<number[]>([]);

    let state = reactive<UseMouseSelectState>({
        isSelecting: false,
        isStartOnSecondHalf: false,
        isEndOnFirstHalf: false,
        selectedItems: [],
        currentInitiator: -1,
    });

    const initIndices = <T>(seed: T[]) => {
        state.selectedItems.length = flatIndices.value.length = 0;
        state.currentInitiator = -1;

        let counter = 0;

        for (let i = 0; i < seed.length; i++) {
            flatIndices.value.push(counter);
            counter++;
        }
    }

    const getTimesFromItems = () => {
        const start = (state.isStartOnSecondHalf) ? state.selectedItems[0] + 0.5 : state.selectedItems[0];
        const modifier = (state.isEndOnFirstHalf) ? 0.5 : 1;
        const end = state.selectedItems[state.selectedItems.length - 1] + modifier;

        return {
            start,
            end,
        };
    };

    const onMouseDown = (index: number, currentInitiator: number | undefined, isSecondHalf?: boolean) => {
        if (state.isSelecting) {
            return;
        }

        startIndex.value = -1;
        endIndex.value = -1;
        state.isSelecting = true;
        state.isStartOnSecondHalf = (isSecondHalf) ? isSecondHalf : false;
        state.currentInitiator = (currentInitiator) ? currentInitiator : -1;
        state.selectedItems.length = 0;
        state.selectedItems.push(index);

        startIndex.value = index;
    };

    const updateIndices = (index: number) => {
        if (index > startIndex.value) {
            // forward
            endIndex.value = index;
            return;
        }

        // backwards
        if (endIndex.value === -1) {
            endIndex.value = index;
            return;
        }

        if (index > endIndex.value) {
            endIndex.value = index;
            return;
        }

        startIndex.value = index;
    };

    const onMouseOver = (index: number, isSecondHalf?: boolean) => {
        if (!state.isSelecting) {
            return;
        }

        updateIndices(index);
        state.isEndOnFirstHalf = !!isSecondHalf;
        state.selectedItems = flatIndices.value.filter((item) => item >= startIndex.value && item <= endIndex.value);
    };

    const onMouseUp = () => {
        if (!state.isSelecting) {
            return;
        }

        state.isSelecting = false;
    };

    return {
        state,
        initIndices,
        getTimesFromItems,
        onMouseDown,
        onMouseOver,
        onMouseUp,
    }
}
