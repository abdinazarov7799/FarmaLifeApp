import {router, useLocalSearchParams} from "expo-router";
import {View, Text, StyleSheet, Pressable, SafeAreaView, TouchableOpacity, FlatList, Image} from "react-native";
import React from "react";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import FilterIcon from "@/assets/icons/filter.svg";
import CheckIcon from "@/assets/icons/check-icon.svg";
import {useTranslation} from "react-i18next";
import useFetchRequest from "@/hooks/api/useFetchRequest";
import Loader from "@/components/shared/Loader";
import {get, head, isArray, isEmpty} from "lodash";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import dayjs from "dayjs";

export default function HistoryView() {
    const { id, title } = useLocalSearchParams();
    const {t} = useTranslation();

    const {data,isPending} = useFetchRequest({
        queryKey: `get-stock-details/${id}`,
        endpoint: `api/admin/history/get-stock-details/${id}`,
        enabled: !!id
    })

    if (isPending) return <Loader />;

    const stock = isArray(get(data, "content", [])) ? get(data, 'content', []) : [];

    return (
        <SafeAreaView style={{flex: 1,backgroundColor: "#fff"}}>
            <View style={styles.header}>
                <Pressable onPress={() => router.push("/history?tab=stocks")}>
                    <ArrowLeft width={24} height={24} />
                </Pressable>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity onPress={() => router.navigate(`/filter?redirect=/history/pharmacy/${id}?title=${title}`)}>
                    <FilterIcon width={20} height={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <FlatList
                    data={stock}
                    keyExtractor={(item, index) => index.toString()}
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
    }
});
