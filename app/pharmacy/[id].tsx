import {router, useLocalSearchParams} from "expo-router";
import {View, Text, StyleSheet, Pressable, FlatList, Image, RefreshControl, ActivityIndicator} from "react-native";
import React from "react";
import CloseIcon from "@/assets/icons/close.svg";
import {useTranslation} from "react-i18next";
import Loader from "@/components/shared/Loader";
import {get, head, isArray, isEmpty} from "lodash";
import {SafeAreaView} from "react-native-safe-area-context";
import CheckIcon from "@/assets/icons/check.svg";
import dayjs from "dayjs";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";
import {Button} from "native-base";

export default function PharmacyView() {
    const { id, title, inn } = useLocalSearchParams();
    const {t} = useTranslation();

    const {data,isLoading ,isRefreshing, onRefresh, onEndReached, isFetchingNextPage} = useInfiniteScroll({
        key: `stocks/${id}`,
        url: `api/app/stocks/${id}`,
        limit: 20
    })

    return (
        <SafeAreaView style={{flex: 1,backgroundColor: "#fff"}}>
            <View style={styles.header}>
                <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {title[0]}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <Text style={styles.headerInn}>{t("INN")}: {inn}</Text>
                    </View>
                </View>
                <Pressable onPress={() => router.push("/pharmacies")}>
                    <CloseIcon />
                </Pressable>
            </View>

            <View style={styles.container}>
                <View style={{marginBottom: 16}}>
                    <Text style={{fontSize: 18,fontWeight: 500,lineHeight: 22}}>{t("Qoldiqlarim")} ({isArray(data) ? data?.length : 0})</Text>
                </View>
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
                                    keyExtractor={(item,index) => `sub_${index}`}
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

            <View style={{position: "absolute", bottom: 0, backgroundColor: "#fff", paddingTop: 12, paddingBottom: 25, paddingHorizontal: 20,width: "100%"}}>
                <Button style={styles.stockButton} onPress={() => router.push(`/pharmacy/stocks?id=${id}&a=b`)}>
                    <Text style={{fontSize: 16, lineHeight: 20, color: "#fff"}}>{t("Qoldiq kiritish")}</Text>
                </Button>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F1F5F8",
        paddingHorizontal: 16,
        paddingTop: 24,
        flex: 1
    },
    header: {
        height: 52,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        backgroundColor: "#fff",
    },
    headerTitle: {
        color: "#000",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 18.75,
    },
    headerInn: {
        color: "#000",
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 16.41,
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 26,
        fontWeight: 400
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: '50%',
        backgroundColor: "#7B85CC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    title: {
        marginLeft: 9,
        fontWeight: 500,
        fontSize: 12,
        lineHeight: 14
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
    stockButton: {
        backgroundColor: "#00C249",
        paddingVertical: 12,
        borderRadius: 6
    }
});
