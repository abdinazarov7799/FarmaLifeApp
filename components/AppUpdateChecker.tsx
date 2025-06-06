import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import * as Application from 'expo-application';
import useFetchRequest from "@/hooks/api/useFetchRequest";
import { get } from "lodash";
import {useTranslation} from "react-i18next";
import {useAuthStore} from "@/store";

const AppUpdateChecker = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const setUser = useAuthStore(state => get(state,'setUser',()=>{}));
    const accessToken = useAuthStore(state => (state as any).accessToken);
    const {t} = useTranslation();
    const { data } = useFetchRequest({
        endpoint: '/api/app/user-profile/get-me',
        queryKey: '/api/app/user-profile/get-me',
        enabled: !!accessToken
    });
    const version = Platform.OS === 'ios' ? get(data,'iosVersion') : get(data,'androidVersion');
    const storeUrl = Platform.OS === 'android' ? get(data, 'androidUrl') : get(data, 'iosUrl');

    function isVersionCompatible() {
        const parseVersion = (version:any) => version.split('.').map(Number);

        const [reqMajor, reqMinor, reqPatch] = parseVersion(version);
        const [curMajor, curMinor, curPatch] = parseVersion(Application?.nativeApplicationVersion);

        if (curMajor > reqMajor) return true;
        if (curMajor < reqMajor) return false;

        if (curMinor > reqMinor) return true;
        if (curMinor < reqMinor) return false;

        return curPatch >= reqPatch;
    }

    useEffect(() => {
        // @ts-ignore
        setUser(data)
        if (!!version && !!Application) {
            if (isVersionCompatible()) {
                setModalVisible(false);
            } else {
                setModalVisible(true);
            }
        }
    }, [data]);

    const handleUpdatePress = () => {
        if (storeUrl) {
            Linking.openURL(storeUrl).catch((err) =>
                console.error("Failed to open URL:", err)
            );
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{t("Ilovaning yangi versiyasi mavjud")}</Text>
                    <Text style={styles.modalMessage}>{t("Iltimos, ilovani yangilang")}</Text>
                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress}>
                        <Text style={styles.updateButtonText}>{t("Yangilash")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    updateButton: {
        width: "100%",
        backgroundColor: '#007AFF',
        borderRadius: 5,
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    updateButtonText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AppUpdateChecker;
