import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// const storage = new MMKV();
//
// const mmkvStorage = {
//     getItem: (key) => {
//         const value = storage.getString(key);
//         return Promise.resolve(value || null);
//     },
//     setItem: (key, value) => {
//         storage.set(key, value);
//         return Promise.resolve();
//     },
//     removeItem: (key) => {
//         storage.delete(key);
//         return Promise.resolve();
//     }
// };

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
        // {
        //     name: 'auth-storage',
        //     getStorage: () => mmkvStorage,
        // }
    )
);
