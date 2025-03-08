import {
    ActivityIndicator,
    FlatList, Pressable, RefreshControl, ScrollView,
    StyleSheet, TouchableOpacity,
    View,
} from 'react-native';
import React, {useLayoutEffect} from "react";
import { Text } from "react-native";
import {useTranslation} from "react-i18next";
import useFetchRequest from "@/hooks/api/useFetchRequest";
import Loader from "@/components/shared/Loader";
import {get, isArray, isEmpty} from "lodash";
import dayjs from "dayjs";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {useNavigation, useRouter} from "expo-router";
import FilterIcon from "@/assets/icons/filter.svg";
import HumanIcon from "@/assets/icons/human.svg";
import PillsIcon from "@/assets/icons/Pills.svg";
import RefreshIcon from "@/assets/icons/refresh.svg";
import {useAuthStore, useNetworkStore} from "@/store";
import {OfflineManager} from "@/lib/offlineManager";

export default function HomeScreen() {
    const {t} = useTranslation();
    const {offlineVisits,isOfflineSyncing} = useAuthStore();
    const {isOnline} = useNetworkStore()
    const navigation = useNavigation();
    const router = useRouter();
    const {data,isPending,refetch,isRefetching} = useFetchRequest({
        queryKey: "home",
        endpoint: "api/app/home/"
    })

    const stocks = isArray(get(data, 'stocks', [])) ? get(data, 'stocks', []) : [];
    const visits = isArray(get(data, 'stocks', [])) ? get(data, 'visits', []) : [];
    //
    // useLayoutEffect(() => {
    //     navigation.setOptions({
    //         headerRight: () => (
    //             <TouchableOpacity onPress={() => router.navigate('/filter?redirect=/')} style={{marginRight:16}}>
    //                 <FilterIcon width={20} height={20} />
    //             </TouchableOpacity>
    //         )
    //     });
    // },[navigation])

    const onSync = () => {
        OfflineManager(isOnline)
    }

    if (isPending) return <Loader />;

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                <Text style={styles.title}>{t("Дневной отчет")}, {dayjs().format("DD-MMMM")}</Text>
                <View style={{marginTop: 14, marginBottom: 10, gap: 10,display: 'flex', flexDirection: "row",justifyContent: 'space-between' }}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t("Bugun kiritilgan qoldiqlar soni")}</Text>
                        <View style={{display: 'flex', flexDirection: "row", justifyContent: 'space-between' ,marginTop: 6}}>
                            <Text style={styles.cardText}>{get(data,'stockCount','-')} {t("ta")}</Text>
                            <PillsIcon width={36} height={36} />
                        </View>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t("Bugun qilingan tashriflar soni")}</Text>
                        <View style={{display: 'flex', flexDirection: "row", justifyContent: 'space-between' ,marginTop: 6}}>
                            <Text style={styles.cardText}>{get(data,'visitCount','-')} {t("ta")}</Text>
                            <HumanIcon width={20} height={30} />
                        </View>
                    </View>
                </View>

                <View style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>{t("Bugun kiritilgan qoldiqlar ro’yxati")}</Text>
                    </View>

                    <View style={{paddingHorizontal: 16, paddingVertical: 6}}>
                        <FlatList
                            data={stocks}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={<ListEmptyComponent text={null}/>}
                            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch}/>}
                            renderItem={({ item }) => (
                                <View style={styles.listItem}>
                                    <View style={styles.listInfo}>
                                        <Text style={styles.listTitleText}>{get(item,'pharmacyName')}</Text>
                                        <Text style={styles.listSubtitle}>{t("INN")}: {get(item,'inn')}</Text>
                                    </View>
                                    <Text style={styles.listAmount}>{get(item,'count')} {t("ta")}</Text>
                                </View>
                            )}
                        />
                    </View>
                </View>

                <View style={[styles.listContainer,{marginTop: 10}]}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>{t("Bugun qilingan tashriflar ro’yxati ")}</Text>
                    </View>

                    <View style={{paddingHorizontal: 16, paddingVertical: 6}}>
                        <FlatList
                            data={visits}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={<ListEmptyComponent text={null}/>}
                            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch}/>}
                            renderItem={({ item }) => (
                                <View style={styles.listItem}>
                                    <View style={{width: 40,height: 40,justifyContent: "center",alignItems: "center",backgroundColor: "#E7EEF4",borderRadius: "50%"}}>
                                        <Text style={{fontSize: 25,color: "#6B7280"}}>
                                            {String(get(item,'medInstitution[0]',''))?.toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={{marginLeft: 12}}>
                                        <Text style={{color: "#6B7280",fontWeight: 500,fontSize: 14}}>{get(item,'medInstitution','')}</Text>
                                        <Text style={{fontWeight: 500,fontSize:12}}>{get(item,'doctor','')}</Text>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </View>
            <View style={[styles.floatButton,{backgroundColor: isEmpty(offlineVisits) ? "#0C5591" : "rgb(198,169,24)"}]}>
                {
                    isOfflineSyncing ? <ActivityIndicator size={"small"} color="#fff" /> : (
                        <Pressable onPress={onSync}>
                            <RefreshIcon />
                        </Pressable>
                    )
                }
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
    listHeader: {
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        backgroundColor: "#0C55911A",
        padding: 10
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
    },
    listSubtitle: {
        fontSize: 12,
    },
    listAmount: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0C5591"
    },
    floatButton: {
        position: "absolute",
        right: 16,
        bottom: 40,
        width: 52,
        height: 52,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
});
