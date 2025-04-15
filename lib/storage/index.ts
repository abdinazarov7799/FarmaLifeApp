import {MMKV} from "react-native-mmkv";

export const mmkvStorage = new MMKV();

export const storageAdapter = {
    getItem: (key: string) => {
        return mmkvStorage.getString(key) ?? null;
    },
    setItem: (key: string, value: any) => {
        const valueToStore = typeof value === "string" ? value : JSON.stringify(value);
        mmkvStorage.set(key, valueToStore);
    },
    removeItem: (key: string) => {
        mmkvStorage.delete(key);
    },
};

