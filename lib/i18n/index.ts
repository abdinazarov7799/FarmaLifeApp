import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import I18NextHttpBackend from "i18next-http-backend";
import {useAuthStore} from "@/store";

i18n
    .use({
        type: 'languageDetector',
        async: true,
        detect: async (cb: (lng: string) => void) => {
            const lng = await useAuthStore.getState().lang || 'uz';
            cb(lng);
        },
    })
    .use(initReactI18next)
    .use(I18NextHttpBackend)
    .init({
        fallbackLng: 'uz',
        saveMissing: false,
        defaultNS: 'main',
        compatibilityJSON: 'v3',
        react: {
            useSuspense: false,
        },
        interpolation: {
            escapeValue: false
        },
        backend: {
            loadPath: `https://farmalife.mediasolutions.uz/api/admin/language/get-by-lang?language={{lng}}`,
            addPath: `https://farmalife.mediasolutions.uz/api/admin/language/create-key`,
        },
    });

export default i18n;
