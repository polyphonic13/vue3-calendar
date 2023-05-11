export function useLocalStorage() {

    const get = <T>(key: string): T | undefined => {
        const valueString: string | null = window.localStorage.getItem(key);

        if (!valueString) {
            return;
        }

        return JSON.parse(valueString) as T;
    };

    const set = <T>(key: string, value: T) => {
        const saved = get<T>(key);

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
        get,
        set,
    };
};
