import { ref } from 'vue'
import { useEventListener } from './use-event-listener'

export function useMouseMovedInfo() {
    let isMoving = false;
    let startX = 0;
    let endX = 0;
    let startY = 0;
    let endY = 0;

    const top = ref(0);
    const left = ref(0);
    const height = ref(0);
    const width = ref(0);

    useEventListener(document, 'mousedown', (event: MouseEvent) => {
        if (isMoving) {
            return;
        }
        isMoving = true;
        startX = event.screenX;
        startY = event.screenY;
    });

    useEventListener(document, 'mouseup', (event: MouseEvent) => {
        if (!isMoving) {
            return;
        }

        isMoving = false;
        endX = event.screenX;
        endY = event.screenY;

        left.value = (startX < endX) ? startX : endX;
        top.value = (startY < endY) ? startY : endY;
        height.value = (startY < endY) ? endY - startY : startY - endY;
        width.value = (startX < endX) ? endX - startX : startX - endX;
        // console.log(`left, top, height and width now = ${left.value}, ${top.value}, ${height.value}, ${width.value}`);
        startX = startY = endX = endY = 0;
    });

    return { top, left, height, width };
}
