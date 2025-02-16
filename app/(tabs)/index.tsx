import {
    FlatList,
    Image,
    StyleSheet,
    View,
} from 'react-native';
import React from "react";
import { Text } from "react-native";
import {useTranslation} from "react-i18next";
import useFetchRequest from "@/hooks/api/useFetchRequest";
import Loader from "@/components/shared/Loader";
import {get, isArray} from "lodash";
import dayjs from "dayjs";

export default function HomeScreen() {
    const {t} = useTranslation();
    const {data,isPending} = useFetchRequest({
        queryKey: "home",
        endpoint: "api/app/home/"
    })
    const stocks = isArray(get(data, 'stocks', [])) ? get(data, 'stocks', []) : [];
    const visits = isArray(get(data, 'stocks', [])) ? get(data, 'visits', []) : [];

    if (isPending) return <Loader />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("Дневной отчет, ")}{dayjs().format("DD-MMMM")}</Text>
            <View style={{marginTop: 14, marginBottom: 10, gap: 10,display: 'flex', flexDirection: "row",justifyContent: 'space-between' }}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t("Bugun kiritilgan qoldiqlar soni")}</Text>
                    <View style={{display: 'flex', flexDirection: "row", justifyContent: 'space-between' ,marginTop: 6}}>
                        <Text style={styles.cardText}>{get(data,'stockCount','-')} {t("ta")}</Text>
                        <Image source={require('@/assets/icons/Pills.png')} style={{width: 36, height: 36}}/>
                    </View>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t("Bugun qilingan tashriflar soni")}</Text>
                    <View style={{display: 'flex', flexDirection: "row", justifyContent: 'space-between' ,marginTop: 6}}>
                        <Text style={styles.cardText}>{get(data,'visitCount','-')} {t("ta")}</Text>
                        <Image source={require('@/assets/icons/human.png')} style={{width: 20, height: 30}}/>
                    </View>
                </View>
            </View>

            <View style={styles.listContainer}>
                <View style={{backgroundColor: "#0C55911A", padding: 10, borderRadius: 14}}>
                    <Text style={styles.listTitle}>{t("Bugun kiritilgan qoldiqlar ro’yxati")}</Text>
                </View>

                <View style={{padding: 16}}>
                    <FlatList
                        data={stocks}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.listItem}>
                                {/*<Image source={{ uri: item.image }} style={styles.listImage} />*/}
                                <View style={styles.listInfo}>
                                    <Text style={styles.listTitleText}>{get(item,'pharmacyName')}</Text>
                                    <Text style={styles.listSubtitle}>INN: {item.inn}</Text>
                                </View>
                                <Text style={styles.listAmount}>{item.amount} {t("ta")}</Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F8',
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    title: {
        fontWeight: 600,
        fontSize: 16,
        color: "#0C5591"
    },
    card: {
        backgroundColor: "#fff",
        width: "48%",
        borderRadius: 14,
        padding: 10,
        shadowColor: "#083346",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 5,
    },
    cardTitle: {
        color: "#4B5563",
        fontWeight: 500,
        fontSize: 12,
        width: "60%"
    },
    cardText: {
        fontSize: 20,
        fontWeight: 700,
        color: "#0C5591",
        marginTop: 6
    },
    listContainer: {
        backgroundColor: "#fff",
        borderRadius: 14,
        shadowColor: "#083346",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 3,
    },
    listTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4B5563",
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB"
    },
    listImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10
    },
    listInfo: {
        flex: 1
    },
    listTitleText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000"
    },
    listSubtitle: {
        fontSize: 12,
        color: "#6B7280"
    },
    listAmount: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0C5591"
    }
});
