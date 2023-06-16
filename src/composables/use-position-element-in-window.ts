import type { IBox, ICoordinates } from '@/interfaces';
import { MOBILE_WINDOW_WIDTH } from '@/stores/ui';

export function usePositionElementInWindow() {

    const positionByMouseCoords = (mouse: ICoordinates, win: IBox, target: HTMLElement | null, offset: number = 0) => {
        const { x, y } = mouse;

        if (!target) {
            return {
                x,
                y,
            };
        }

        const winWidth = win.width;
        const winHeight = win.height;
        const targetWidth = target.clientWidth;
        const targetHeight = target.clientHeight;

        if ((x === 0 && y === 0) || (winWidth <= MOBILE_WINDOW_WIDTH)) {
            // keyboard click yielded no mouse x/y OR mobile, position in center
            return {
                x: (winWidth / 2) - (targetWidth / 2),
                y: (winHeight / 2) - (targetHeight / 2),
            };
        }

        const coordX = ((x + (targetWidth / 2)) >= winWidth) ? winWidth - (targetWidth + offset) : x - (targetWidth / 2);
        const coordY = ((y + targetHeight) >= winHeight) ? winHeight - (targetHeight + offset) : y + offset;

        return {
            x: coordX,
            y: coordY,
        };
    };

    return {
        positionByMouseCoords,
    };
};

