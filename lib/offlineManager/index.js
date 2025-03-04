import { useAuthStore } from "../../store";
import { get, isArray, isEmpty } from "lodash";
import { request } from "../api";

export const OfflineManager = async (isOnline) => {
    if (isOnline) {
        const { offlineVisits, setIsOfflineSyncing, removeFromOfflineVisits, offlineStocks, removeFromOfflineStocks } = useAuthStore.getState();

        if (!isEmpty(offlineVisits) && isArray(offlineVisits)) {
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

        if (!isEmpty(offlineStocks) && isArray(offlineStocks)) {
            try {
                setIsOfflineSyncing(true);
                for (const item of offlineStocks) {
                    let finalPhotoUrl = item.photoUrl;

                    // ✅ Agar `photoUrl` lokal rasm bo‘lsa, serverga yuklaymiz
                    if (!finalPhotoUrl.startsWith("http")) {
                        try {
                            const formData = new FormData();
                            formData.append("file", {
                                uri: item.photoUrl,
                                name: "photo.jpg",
                                type: "image/jpeg",
                            });

                            const response = await request.post("api/files/upload", formData, {
                                headers: { "Content-Type": "multipart/form-data" },
                            });

                            if (response.data) {
                                finalPhotoUrl = response.data;
                            } else {
                                console.error("Rasm yuklanmadi, eski URL ishlatiladi");
                            }
                        } catch (uploadError) {
                            console.error("Rasm yuklashda xatolik:", uploadError);
                        }
                    }

                    // ✅ Rasm yuklanganidan keyin stock ma'lumotlarini yuboramiz
                    await request.post("api/app/stocks/add", {
                        pharmacyId: item.pharmacyId,
                        createdTime: item.createdTime,
                        photoUrl: finalPhotoUrl, // ✅ Yangilangan URL bilan
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
