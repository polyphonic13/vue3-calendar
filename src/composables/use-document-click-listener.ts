type docClickEvtListener = (event: MouseEvent) => void;

export function useDocumentClickListener() {

    let listeners: docClickEvtListener[] = [];

    const addDocumentClickListener = (listener: docClickEvtListener) => {
        document.addEventListener('click', listener);

        if (listeners.includes(listener)) {
            return;
        }
        listeners.push(listener);
    };

    const removeDocumentClickListener = (listener: docClickEvtListener) => {
        document.removeEventListener('click', listener);
        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
    };

    return {
        addDocumentClickListener,
        removeDocumentClickListener,
    };
}
