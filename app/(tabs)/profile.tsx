import {
    Image, Modal, Pressable, SafeAreaView,
    StyleSheet, Text, TouchableOpacity,
    View,
} from "react-native";
import React, {useState} from "react";
import {useAuthStore} from "@/store";
import {get} from "lodash";
import {useTranslation} from "react-i18next";
import i18n from "@/lib/i18n";
import {Feather, Ionicons} from "@expo/vector-icons";
import {request} from "@/lib/api";
import {router} from "expo-router";

export default function ProfileScreen() {
    const user = useAuthStore(state => get(state, "user",{}));
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const lang = useAuthStore(state => (state as any).lang);
    const setLanguage = useAuthStore(state => (state as any).setLang);
    const clearAuthData = useAuthStore(state => (state as any).clearAuthData);

    const changeLanguage = (value: string) => {
        i18n.changeLanguage(value);
        setLanguage(value);
        setOpen(false);
    };

    const handleLogOut = () => {
        request.post('/api/app/auth/logout').then(r => {
            clearAuthData();
            router.push("/auth");
        }).catch(reason => {
            clearAuthData();
            router.push("/auth");
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Text style={{color: "#fff", fontSize: 38, fontWeight: 500}}>{get(user,'firstName[0]')}{get(user,'lastName[0]')}</Text>
            </View>

            <View style={styles.card}>
                <Text style={{fontWeight: 500, fontSize: 18,marginBottom: 21}}>{t("Umumiy")}</Text>

                <View style={styles.listItem}>
                    <View style={styles.listIcon}>
                        <Image source={require('@/assets/icons/user-icon.png')} width={24} height={24} />
                    </View>
                    <Text style={styles.listText}>{get(user,'lastName')} {get(user,'firstName')}</Text>
                </View>
                <View style={[styles.listItem,{marginVertical: 16}]}>
                    <View style={styles.listIcon}>
                        <Image source={require('@/assets/icons/phone-icon.png')} width={24} height={24} />
                    </View>
                    <Text style={styles.listText}>{get(user,'phoneNumber')}</Text>
                </View>
                <TouchableOpacity style={styles.listItem} onPress={() => setOpen(true)}>
                    <View style={styles.listIcon}>
                        <Image source={require('@/assets/icons/lang-icon.png')} width={24} height={24} />
                    </View>
                    <Text style={styles.listText}>{t("Til")}</Text>
                    <View style={styles.optionIconContainer}>
                        <Text style={styles.langText}>{t(lang)}</Text>
                        <Feather name="chevron-right" size={18} color="#919DA6" />
                    </View>
                </TouchableOpacity>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={open}
                    onRequestClose={() => setOpen(false)}
                >
                    <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
                        <View style={styles.modalContainer}>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => changeLanguage("uz")}
                            >
                                <Text style={[styles.modalText, { color: lang === "uz" ? "#246bb2" : "#000" }]}>
                                    O‘zbek tili
                                </Text>
                                {lang === "uz" && <Ionicons name="checkmark" size={18} color="blue" />}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => changeLanguage("ru")}
                            >
                                <Text style={[styles.modalText, { color: lang === "ru" ? "#246bb2" : "#000" }]}>
                                    Русский язык
                                </Text>
                                {lang === "ru" && <Ionicons name="checkmark" size={18} color="blue" />}
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Modal>
            </View>
            <TouchableOpacity style={styles.logOutButton} onPress={() => setIsOpenModal(true)}>
                <Image source={require('@/assets/icons/logout-icon.png')} width={24} height={24} />
                <Text style={styles.logOutText}>{t("Chiqish")}</Text>
            </TouchableOpacity>
            <SafeAreaView style={styles.centeredView}>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isOpenModal}
                >
                    <Pressable style={styles.overlay} onPress={() => setIsOpenModal(false)}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Image source={require('@/assets/icons/logout2-icon.png')} width={60} height={60} />
                                <Text style={{fontWeight: 500,fontSize: 18,marginTop: 16,marginBottom:40}}>
                                    {t("Tizimdan chiqib ketmoqchimisiz")}
                                </Text>
                                <View style={{display: "flex",flexDirection: "row",marginLeft: "auto",alignItems: "center"}}>
                                    <Pressable onPress={handleLogOut}>
                                        <Text style={{color: "#0C5591",fontWeight: 600,fontSize: 16}}>
                                            {t("Chiqish")}
                                        </Text>
                                    </Pressable>
                                    <Pressable onPress={() => setIsOpenModal(false)}>
                                        <Text style={{color: "#0C5591",fontWeight: 400,fontSize: 16,marginLeft: 43}}>
                                            {t("Bekor qilish")}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F8',
        paddingHorizontal: 16,
        paddingTop: 40,
    },
    avatar: {
        marginHorizontal: 'auto',
        justifyContent: "center",
        alignItems: "center",
        width: 80,
        height: 80,
        borderRadius: '50%',
        textAlign: "center",
        backgroundColor: "#AAB8C5"
    },
    card: {
        padding: 20,
        backgroundColor: "#fff",
        marginTop: 40,
        marginBottom: 26,
        borderRadius: 14,
    },
    logOutButton: {
        padding: 14,
        backgroundColor: "#fff",
        borderRadius: 14,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    listItem: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    listIcon: {
        width: 44,
        height: 44,
        borderRadius: "50%",
        backgroundColor: "#0C559126",
        justifyContent: "center",
        alignItems: "center"
    },
    listText: {
        marginLeft: 14,
        fontWeight: 400,
        fontSize: 16
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: 200,
        marginTop: 100,
        marginRight: -70,
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    modalText: {
        fontSize: 15,
    },
    optionIconContainer: {
        marginLeft: "auto",
        flexDirection: "row",
        alignItems: "center",
    },
    langText: {
        fontSize: 13,
        color: "#7A8189",
        marginRight: 4,
    },
    logOutText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 500,
        color: "#222222"
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
