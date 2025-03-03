import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import {createJSONStorage, persist,} from 'zustand/middleware';

const storage = new MMKV();

const mmkvStorage = {
    setItem: (name:any, value:any) => {
        return storage.set(name, value);
    },
    getItem: (name:any) => {
        const value = storage.getString(name);
        return value ?? null;
    },
    removeItem: (name:any) => {
        return storage.delete(name);
    },
};

export const useAuthStore = create(
    persist(
        (set,get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            lang: 'uz',
            offlineVisits: [],
            offlineStocks: [],
            isOfflineSyncing: false,

            setUser: (user:any) => set({ user }),
            setAccessToken: (accessToken:any) => set({ accessToken }),
            setRefreshToken: (refreshToken:any) => set({ refreshToken }),
            setLang: (lang:any) => set({ lang }),
            setOfflineVisits: (offlineVisits:any) => set({ offlineVisits }),
            addToOfflineVisits: (visit: any) => set({ offlineVisits: [...get().offlineVisits, visit] }),
            setIsOfflineSyncing: (isLoading: boolean) => set({ isOfflineSyncing: isLoading }),
            removeFromOfflineVisits: (visitId: string) =>
                set({
                    offlineVisits: get().offlineVisits.filter(
                        (visit) => visit.id !== visitId
                    ),
                }),

            setOfflineStocks: (stocks) => set({ offlineStocks: stocks }),

            addToOfflineStocks: (stock) => {
                set({ offlineStocks: [...get().offlineStocks, stock] });
            },

            removeFromOfflineStocks: (stockId) => {
                set({
                    offlineStocks: get().offlineStocks.filter(
                        (stock) => stock.id !== stockId
                    ),
                });
            },

            clearAuthData: () => set({
                user: null,
                accessToken: null,
                refreshToken: null,
                offlineVisits: [],
                offlineStocks: [],
            }),
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => mmkvStorage),
        },
    )
);

export const useNetworkStore = create((set) => ({
    isOnline: true,
    setIsOnline: (isOnline: boolean) => set({ isOnline }),
}));
