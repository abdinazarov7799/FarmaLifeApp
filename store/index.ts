import { create } from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {storageAdapter} from "@/lib/storage";

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

            removeFromOfflineStocks: (pharmacyId) => {
                set({
                    offlineStocks: get().offlineStocks.filter(
                        (stock) => stock.pharmacyId !== pharmacyId
                    ),
                });
            },

            clearAuthData: () => set({
                user: null,
                accessToken: null,
                refreshToken: null,
            }),
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => storageAdapter),
        },
    )
);
