import {
    StyleSheet,
    View,
    TouchableOpacity,
    FlatList,
    Text, Image,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useFetchRequest from "@/hooks/api/useFetchRequest";
import Loader from "@/components/shared/Loader";
import { get } from "lodash";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {router, useNavigation} from "expo-router";
import SearchIcon from '@/assets/icons/search.svg'
import FilterIcon from '@/assets/icons/filter.svg'

export default function HistoryScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { data:visitsData, isPending:isPendingVisits } = useFetchRequest({
        queryKey: "visits_list",
        endpoint: "api/admin/history/get-visits"
    });

    const { data:stocksData, isPending:isPendingStocks } = useFetchRequest({
        queryKey: "stocks_list",
        endpoint: "api/admin/history/get-stocks"
    });

    navigation.setOptions({
        headerRight: () => (
            <View style={{display: "flex",flexDirection: "row",alignItems: "center",gap: 24,marginRight: 16}}>
                <TouchableOpacity onPress={() => router.navigate('/filter?redirect=/history')}>
                    <SearchIcon width={20} height={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.navigate('/filter?redirect=/history')}>
                    <FilterIcon width={20} height={20} />
                </TouchableOpacity>
            </View>
        )
    });
    const [activeTab, setActiveTab] = useState("stocks");

    if (isPendingVisits || isPendingStocks) return <Loader />;

    const stocks = get(stocksData, "content", []);
    const visits = get(visitsData, "content", []);

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "stocks" && styles.activeTab]}
                    onPress={() => setActiveTab("stocks")}
                >
                    <Text style={[styles.tabText, activeTab === "stocks" && styles.activeTabText]}>
                        {t("Qoldiq tarixi")}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "visits" && styles.activeTab]}
                    onPress={() => setActiveTab("visits")}
                >
                    <Text style={[styles.tabText, activeTab === "visits" && styles.activeTabText]}>
                        {t("Tashrif tarixi")}
                    </Text>
                </TouchableOpacity>
            </View>

            {
                activeTab === "stocks" ? (
                    <FlatList
                        data={stocks}
                        keyExtractor={(item, index) => index.toString()}
                        ListEmptyComponent={<ListEmptyComponent text={null}/>}
                        renderItem={({ item }) => (
                            <View style={styles.listItem}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {activeTab === "stocks" ? "A" : "X"}
                                    </Text>
                                </View>
                                <View style={styles.listInfo}>
                                    <Text style={styles.listTitle}>{get(item,'name')}</Text>
                                    <Text style={styles.listSubtitle}>INN: {get(item,'inn')}</Text>
                                </View>
                            </View>
                        )}
                    />
                ) : (
                    <FlatList
                        data={visits}
                        keyExtractor={(item, index) => index.toString()}
                        ListEmptyComponent={<ListEmptyComponent text={null} />}
                        renderItem={({ item }) => (
                            <View style={styles.listItem}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {get(item,'name[0]','')}
                                    </Text>
                                </View>
                                <Text style={styles.listTitle2}>{get(item,'name','')}</Text>
                            </View>
                        )}
                    />
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F8',
        paddingHorizontal: 16,
        paddingTop: 10
    },
    tabs: {
        flexDirection: "row",
        backgroundColor: "#E5E7EB",
        borderRadius: 8,
        marginBottom: 10,
        padding: 4
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 8
    },
    activeTab: {
        backgroundColor: "#0C5591"
    },
    tabText: {
        fontSize: 16,
        fontWeight: "400",
        color: "#999999"
    },
    activeTabText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8
    },
    avatar: {
        width: 53,
        height: 53,
        borderRadius: '50%',
        backgroundColor: "#7B85CC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 26,
        fontWeight: 400
    },
    listInfo: {
        flex: 1
    },
    listTitle: {
        fontSize: 16,
        fontWeight: "400",
        color: "#000"
    },
    listTitle2: {
        fontSize: 18,
        fontWeight: "400",
        color: "#000"
    },
    listSubtitle: {
        fontSize: 14,
        color: "#6B7280"
    }
});
