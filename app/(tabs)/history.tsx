import {
    StyleSheet,
    View,
    TouchableOpacity,
    FlatList,
    Text, RefreshControl, ActivityIndicator,
} from "react-native";
import React, {useEffect, useLayoutEffect, useState} from "react";
import { useTranslation } from "react-i18next";
import Loader from "@/components/shared/Loader";
import {get, isEmpty} from "lodash";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {router, useLocalSearchParams, useNavigation} from "expo-router";
import SearchIcon from '@/assets/icons/search.svg'
import FilterIcon from '@/assets/icons/filter.svg'
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";
import dayjs from "dayjs";

export default function HistoryScreen() {
    const { t } = useTranslation();
    const { tab, from, to } = useLocalSearchParams();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState("stocks");

    useEffect(() => {
      if (!isEmpty(tab)) {
          setActiveTab(tab);
      }
    },[])

    const {
        data:visits,
        isLoading,
        isRefreshing,
        onRefresh,
        onEndReached,
        isFetchingNextPage
    } = useInfiniteScroll({
        key: `visits_list`,
        url: `api/admin/history/get-visits`,
        limit: 20,
        filters: {
            from,
            to
        }
    })

    const {
        data:stocks,
        isLoading:isLoadingStocks,
        isRefreshing:isRefreshingStocks,
        onRefresh:onRefreshStocks,
        onEndReached: onEndReachedStocks,
        isFetchingNextPage:isFetchingNextPageStocks
    } = useInfiniteScroll({
        key: `stocks_list`,
        url: `api/admin/history/get-stocks`,
        limit: 20,
        filters: {
            from,
            to
        }
    })

    // useLayoutEffect(() => {
    //     navigation.setOptions({
    //         headerRight: () => (
    //             <View style={{display: "flex",flexDirection: "row",alignItems: "center",gap: 24,marginRight: 16}}>
    //                 {/*<TouchableOpacity>*/}
    //                 {/*    <SearchIcon width={20} height={20} />*/}
    //                 {/*</TouchableOpacity>*/}
    //                 <TouchableOpacity onPress={() => {
    //                     console.log(activeTab,'aaa')
    //                     router.push({
    //                         pathname: "/filter",
    //                         params: {
    //                             redirect: `/history?tab=${activeTab}`
    //                         }
    //                     })
    //                 }}>
    //                     <FilterIcon width={20} height={20} />
    //                 </TouchableOpacity>
    //             </View>
    //         )
    //     });
    // }, [navigation,activeTab]);

    if (isLoading || isLoadingStocks) return <Loader />;

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
                        onEndReached={onEndReachedStocks}
                        refreshControl={<RefreshControl refreshing={isRefreshingStocks} onRefresh={onRefreshStocks} />}
                        ListEmptyComponent={<ListEmptyComponent text={null}/>}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => router.push(`/history/pharmacy/${get(item,'id')}?title=${get(item,'name')}&a=b`)}
                                style={styles.listItem}
                            >
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {get(item,'name[0]','')}
                                    </Text>
                                </View>
                                <View style={styles.listInfo}>
                                    <Text style={styles.listTitle}>{get(item,'name')}</Text>
                                    <Text style={styles.listSubtitle}>INN: {get(item,'inn')}</Text>
                                    <Text style={styles.listSubtitle}>{dayjs(get(item,'createdTime')).format('HH:mm DD.MM.YYYY')}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListFooterComponent={
                            <View style={styles.footer}>
                                {isFetchingNextPageStocks && <ActivityIndicator />}
                            </View>
                        }
                    />
                ) : (
                    <FlatList
                        data={visits}
                        keyExtractor={(item, index) => index.toString()}
                        onEndReached={onEndReached}
                        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={<ListEmptyComponent text={null} />}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => router.push(`/history/med/${get(item,'id')}?title=${get(item,'name')}&a=b`)}
                                style={styles.listItem}
                            >
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {get(item,'name[0]','')}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.listTitle2}>{get(item,'name','')}</Text>
                                    <Text style={styles.listSubtitle}>{dayjs(get(item,'createdTime')).format('HH:mm DD.MM.YYYY')}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListFooterComponent={
                            <View style={styles.footer}>
                                {isFetchingNextPage && <ActivityIndicator />}
                            </View>
                        }
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
    },
    footer: {
        flexDirection: "row",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
    },
});
