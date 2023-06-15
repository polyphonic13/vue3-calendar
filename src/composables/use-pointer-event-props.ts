import type { ICoordinates } from '@/interfaces';

export function usePointerEventProps() {
    const getCoordsFromEvent = (event: MouseEvent | TouchEvent): ICoordinates => {

        const touchEvent = event as TouchEvent
        if (!touchEvent.touches || !touchEvent.touches[0]) {
            // mouse event
            const mouseEvent = event as MouseEvent;
            return {
                x: mouseEvent.pageX,
                y: mouseEvent.pageY,
            };
        }

        return {
            x: touchEvent.touches[0].clientX,
            y: touchEvent.touches[0].clientY,
        };
    };

    return {
        getCoordsFromEvent,
    };
};
