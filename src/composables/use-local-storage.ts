export function useLocalStorage() {

    const load = <T>(key: string): T | undefined => {
        const valueString: string | null = window.localStorage.getItem(key);

        if (!valueString) {
            return;
        }

        return JSON.parse(valueString) as T;
    };

    const save = <T>(key: string, value: T) => {
        const saved = load<T>(key);

        if (!saved) {
            // save new
            window.localStorage.setItem(key, JSON.stringify(value));
            return;
        }

        value = {
            ...saved,
            ...value,
        };

        // update existing
        window.localStorage.setItem(key, JSON.stringify(value));
    };

    return {
        load,
        save,
    };
};
