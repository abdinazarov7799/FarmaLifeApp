import { useAuthStore } from "../../store";
import { get, isArray, isEmpty } from "lodash";
import { request } from "../api";
import {Alert} from "react-native";

export const OfflineManager = async (isOnline,t) => {
    if (isOnline) {
        const { offlineVisits, setIsOfflineSyncing, removeFromOfflineVisits, offlineStocks, removeFromOfflineStocks } = useAuthStore.getState();

        if (!isEmpty(offlineVisits) && isArray(offlineVisits)) {
            try {
                setIsOfflineSyncing(true);
                for (const item of offlineVisits) {
                    await request.post(
                        `api/app/doctors/visit/${get(item, 'id')}?createdTime=${get(item, 'createdTime')}&lat=${get(item, 'lat')}&lng=${get(item, 'lng')}`
                    );
                    removeFromOfflineVisits(get(item, 'id'));
                }
                Alert.alert(t("Ajoyib"), t("Offline tashriflar yuborildi"));
            } catch (error) {
                Alert.alert(t("Diqqat!"), t("Offline tashriflarni yuborishda xatolik"));
            } finally {
                setIsOfflineSyncing(false);
            }
        }

        if (!isEmpty(offlineStocks) && isArray(offlineStocks)) {
            try {
                setIsOfflineSyncing(true);
                for (const item of offlineStocks) {
                    let finalPhotoUrl = item.photoUrl;

                    if (finalPhotoUrl &&  !finalPhotoUrl.startsWith("http")) {
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
                                Alert.alert(response.data)
                            } else {
                                Alert.alert(t("Diqqat!"), t("Rasm yuklanmadi, eski URL ishlatiladi"));
                            }
                        } catch (uploadError) {
                            Alert.alert(t("Rasm yuklashda xatolik:"), uploadError);
                        }
                    }

                    await request.post("api/app/stocks/add", {
                        pharmacyId: item.pharmacyId,
                        createdTime: item.createdTime,
                        photoUrl: finalPhotoUrl,
                        drugs: item.drugs,
                    });

                    removeFromOfflineStocks(item.pharmacyId);
                }
                Alert.alert(t("Ajoyib"), t("Offline qoldiqlarni yuborildi"));
            } catch (error) {
                Alert.alert(t("Diqqat!"), t("Offline qoldiqlarni yuborishda xatolik"));
            } finally {
                setIsOfflineSyncing(false);
            }
        }
    }
};
