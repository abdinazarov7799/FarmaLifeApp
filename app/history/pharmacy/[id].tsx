import {router, useLocalSearchParams} from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    FlatList,
    Image,
    RefreshControl,
    ActivityIndicator
} from "react-native";
import React, {useState} from "react";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import FilterIcon from "@/assets/icons/filter.svg";
import CheckIcon from "@/assets/icons/check-icon.svg";
import {useTranslation} from "react-i18next";
import Loader from "@/components/shared/Loader";
import {get, head, isArray, isEmpty} from "lodash";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import dayjs from "dayjs";
import {SafeAreaView} from "react-native-safe-area-context";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";
import FilterModal from "@/components/filter";

export default function HistoryView() {
    const { id, title } = useLocalSearchParams();
    const {t} = useTranslation();
    const [from,setFrom] = useState(null)
    const [to,setTo] = useState(null)
    const [isOpen,setIsOpen] = useState(false);

    const {
        data,
        isLoading,
        isRefreshing,
        onRefresh,
        onEndReached,
        isFetchingNextPage
    } = useInfiniteScroll({
        key: `get-stock-details/${id}`,
        url: `api/admin/history/get-stock-details/${id}`,
        limit: 20,
        filters: {
            from,
            to
        }
    })

    if (isLoading) {
        return <Loader />
    }

    return (
        <SafeAreaView style={{flex: 1,backgroundColor: "#fff"}}>
            <View style={styles.header}>
                <Pressable onPress={() => router.push("/history?tab=stocks")}>
                    <ArrowLeft width={24} height={24} />
                </Pressable>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setIsOpen(true)}>
                    <FilterIcon width={20} height={20} />
                </TouchableOpacity>
            </View>

            <FilterModal
                isOpen={isOpen}
                setFrom={setFrom}
                setIsOpen={setIsOpen}
                setTo={setTo}
            />

            <View style={styles.container}>
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={onEndReached}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<ListEmptyComponent text={null}/>}
                    renderItem={({ item }) => {
                        const key = head(Object.keys(item))
                        const items = isArray(get(item,`${key}`)) ? get(item,`${key}`,[]) : []
                        return (
                            <View style={styles.listItem}>
                                <View style={{display: "flex", flexDirection: "row",alignItems: "center", marginBottom: 17}}>
                                    <CheckIcon />
                                    <Text style={styles.title}>{dayjs(key).format("DD.MM.YYYY HH:mm")}</Text>
                                </View>

                                <FlatList
                                    data={items}
                                    keyExtractor={(item) => get(item,'id').toString()}
                                    ListEmptyComponent={<ListEmptyComponent text={null}/>}
                                    renderItem={({ item }) => {
                                        return (
                                            <View style={styles.subListItem}>
                                                <View style={styles.avatar}>
                                                    {
                                                        isEmpty(get(item,'photoUrl')) ? (
                                                            <Text style={styles.avatarText}>
                                                                {get(item,'drugName[0]','')}
                                                            </Text>
                                                        ) : (
                                                            <Image source={get(item,'photoUrl')} />
                                                        )
                                                    }
                                                </View>
                                                <View>
                                                    <Text style={styles.drugName}>{get(item,'drugName')}</Text>
                                                    <Text style={styles.quantityText}>{get(item,'quantity')} {t("dona")}</Text>
                                                </View>
                                            </View>
                                        )
                                    }}
                                />
                            </View>
                        )
                    }}
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
        paddingTop: 24,
        paddingBottom: 60,
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
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 12,
        marginBottom: 6
    },
    subListItem: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    title: {
        marginLeft: 9,
        fontWeight: 500,
        fontSize: 12,
        lineHeight: 14
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: "#7B85CC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 7
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: 400
    },
    drugName: {
        fontWeight: 400,
        fontSize: 12,
        lineHeight: 14.52,
        color: "#083346"
    },
    quantityText: {
        fontWeight: 400,
        fontSize: 12,
        lineHeight: 14.52,
        color: "#083346"
    },
    footer: {
        flexDirection: "row",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
    },
});
