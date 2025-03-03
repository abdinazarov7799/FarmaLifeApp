import { useAuthStore } from "../../store";
import { get, isArray, isEmpty } from "lodash";
import { request } from "../api";

export const OfflineManager = async (isOnline) => {
    if (isOnline) {
        const { offlineVisits, setIsOfflineSyncing, removeFromOfflineVisits, offlineStocks, removeFromOfflineStocks } = useAuthStore.getState();

        if (isEmpty(offlineVisits) && isArray(offlineVisits)) {
            try {
                setIsOfflineSyncing(true);

                for (const item of offlineVisits) {
                    await request.post(
                        `api/app/doctors/visit/${get(item, 'id')}?createdTime=${get(item, 'createdTime')}`,
                        {}
                    );
                    removeFromOfflineVisits(get(item, 'id'));
                }
            } catch (error) {
                console.error("Offline tashrifni yuborishda xatolik:", error);
            } finally {
                setIsOfflineSyncing(false);
            }
        }

        if (!isEmpty(offlineStocks)) {
            try {
                setIsOfflineSyncing(true);
                for (const item of offlineStocks) {
                    await request.post("api/app/stocks/add", {
                        pharmacyId: item.pharmacyId,
                        createdTime: item.createdTime,
                        photoUrl: item.photoUrl,
                        drugs: item.drugs,
                    });
                    removeFromOfflineStocks(item.pharmacyId);
                }
            } catch (error) {
                console.error("Offline qoldiqni yuborishda xatolik:", error);
            } finally {
                setIsOfflineSyncing(false);
            }
        }
    }
};
