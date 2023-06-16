export function usePositionElementInWindow() {

    const positionByMouseCoords = (startX: number, startY: number, target: HTMLElement | null, offset: number = 0) => {
        if (!target) {
            return {
                x: startX,
                y: startY,
            };
        }

        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        const targetWidth = target.clientWidth;
        const targetHeight = target.clientHeight;

        if (startX === 0 && startY === 0) {
            // keyboard click yielded no mouse x/y, position in center
            return {
                x: (winWidth / 2) - (targetWidth / 2),
                y: (winHeight / 2) - (targetHeight / 2),
            };
        }

        const x = ((startX + (targetWidth / 2)) >= winWidth) ? winWidth - (targetWidth + offset) : startX - (targetWidth / 2);
        const y = ((startY + targetHeight) >= winHeight) ? winHeight - (targetHeight + offset) : startY + offset;

        return { x, y, };
    };

    return {
        positionByMouseCoords,
    };
};

