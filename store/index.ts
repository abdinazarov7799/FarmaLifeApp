import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import {
    createJSONStorage,
    devtools,
    persist,
} from 'zustand/middleware';


const storage = new MMKV();

const mmkvStorage = {
    setItem: (name:any, value:any) => {
        return storage.set(name, value);
    },
    getItem: name => {
        const value = storage.getString(name);
        return value ?? null;
    },
    removeItem: name => {
        return storage.delete(name);
    },
};


export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            lang: 'uz',

            setUser: (user) => set({ user }),

            setAccessToken: (accessToken) => set({ accessToken }),

            setRefreshToken: (refreshToken) => set({ refreshToken }),

            setLang: (lang) => set({ lang }),

            clearAuthData: () => set({
                user: null,
                accessToken: null,
                refreshToken: null,
            }),
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => mmkvStorage),
        },
    )
);
