import {router, useLocalSearchParams} from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import React from "react";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import FilterIcon from "@/assets/icons/filter.svg";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {get} from "lodash";
import dayjs from "dayjs";
import {SafeAreaView} from "react-native-safe-area-context";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";

export default function HistoryView() {
    const { id, title, from, to } = useLocalSearchParams();

    const {
        data,
        isLoading,
        isRefreshing,
        onRefresh,
        onEndReached,
        isFetchingNextPage
    } = useInfiniteScroll({
        key: `get-visit-details/${id}`,
        url: `api/admin/history/get-visit-details/${id}`,
        limit: 20,
        filters: {
            from,
            to
        }
    })

    return (
        <SafeAreaView style={{flex: 1,backgroundColor: "#fff"}}>
            <View style={styles.header}>
                <Pressable onPress={() => router.push("/history?tab=visits")}>
                    <ArrowLeft width={24} height={24} />
                </Pressable>
                <Text style={styles.headerTitle}>{title}</Text>
                <View></View>
                {/*<TouchableOpacity onPress={() => router.push(`/filter?redirect=/history/med/${id}?title=${title}&a=b`)}>*/}
                {/*    <FilterIcon width={20} height={20} />*/}
                {/*</TouchableOpacity>*/}
            </View>

            <View style={styles.container}>
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={onEndReached}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<ListEmptyComponent text={null}/>}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {get(item,'fio[0]','')}
                                </Text>
                            </View>
                            <View style={styles.listInfo}>
                                <Text style={styles.listTitle}>{get(item,'fio')}</Text>
                                <Text style={styles.listSubtitle}>{get(item,'position')}</Text>
                                <Text style={styles.listSubtitle2}>{get(item,'phone')}</Text>
                            </View>
                            <Text style={styles.timeText}>{dayjs(get(item,'createdAt')).format("DD.MM.YYYY HH:mm")}</Text>
                        </View>
                    )}
                    ListFooterComponent={
                        <View style={styles.footer}>
                            {isFetchingNextPage && <ActivityIndicator />}
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F1F5F8",
        paddingHorizontal: 16,
        paddingTop: 12,
        flex: 1
    },
    header: {
        height: 46,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontWeight: 500,
        fontSize: 18,
        lineHeight: 21
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
        lineHeight: 18.75,
        color: "#000"
    },
    listSubtitle: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 16.41,
        color: "#999",
        marginVertical: 2
    },
    listSubtitle2: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 16.41,
        color: "#999",
    },
    timeText: {
        marginLeft: "auto",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 14
    },
    footer: {
        flexDirection: "row",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
    },
});
