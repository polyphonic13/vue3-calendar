import { onUnmounted } from 'vue'

export function useEventListener(target: HTMLElement | Document | Window | null, event: string, callback: (event: MouseEvent) => void) {
    // console.log(`useEventListener, target = `, target);

    if (!target) {
        return;
    }
    target.addEventListener(event, callback as EventListenerOrEventListenerObject);

    onUnmounted(() => {
        if (!target) {
            return;
        }
        target.removeEventListener(event, callback as EventListenerOrEventListenerObject)
    });
}
