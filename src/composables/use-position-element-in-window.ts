export function usePositionElementInWindow() {

    const getLocationWithinWindow = (startX: number, startY: number, target: HTMLElement | null, offset: number = 0) => {
        if (!target) {
            return {
                x: startX,
                y: startY,
            };
        }

        const winWidth = window.innerWidth;
        const targetWidth = target.clientWidth;
        const winHeight = window.innerHeight;
        const targetHeight = target.clientHeight;

        const x = ((startX + (targetWidth / 2)) >= winWidth) ? winWidth - (targetWidth + offset) : startX - (targetWidth / 2);
        const y = ((startY + targetHeight) >= winHeight) ? winHeight - (targetHeight + offset) : startY + offset;

        return { x, y, };
    };

    return {
        getLocationWithinWindow,
    };
};

