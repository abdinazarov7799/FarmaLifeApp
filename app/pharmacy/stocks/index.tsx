import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    RefreshControl,
    ActivityIndicator,
    FlatList,
    TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import usePostQuery from "@/hooks/api/usePostQuery";
import dayjs from "dayjs";
import { get, isEmpty } from "lodash";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Button } from "native-base";
import { Formik } from "formik";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import Loader from "@/components/shared/Loader";

export default function StocksAddScreen() {
    const { t } = useTranslation();
    const { id, photoUrl } = useLocalSearchParams();

    const { data, isLoading, isRefreshing, onRefresh, onEndReached, isFetchingNextPage } = useInfiniteScroll({
        key: `drugs`,
        url: `api/app/drugs/get-all`,
        limit: 500,
    });

    const { mutate, isPending: isPendingMutate } = usePostQuery({});

    const onSubmit = (values) => {
        const drugsArray = Object.keys(values).map((key) => ({
            drugId: key,
            quantity: values[key] ? values[key] : 0,
        }));

        mutate(
            {
                endpoint: "api/app/stocks/add",
                attributes: {
                    pharmacyId: id,
                    createdTime: dayjs().unix(),
                    photoUrl: photoUrl,
                    drugs: drugsArray,
                },
            },
            {
                onSuccess: () => {
                    router.push("/pharmacies");
                },
                onError: () => {
                    console.error("Xatolik yuz berdi!");
                },
            }
        );
    };

    if (isLoading) return <Loader />;

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable onPress={() => router.back()}>
                        <ArrowLeft width={24} height={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t("Dorilar ro’yxati")}</Text>
                </View>
            </View>

            <Formik initialValues={{}} onSubmit={onSubmit}>
                {({ handleSubmit, values, setFieldValue }) => (
                    <>
                        <FlatList
                            data={data}
                            keyExtractor={(item) => get(item, "id", "").toString()}
                            ListEmptyComponent={<ListEmptyComponent text={t("Ma'lumot mavjud emas")} />}
                            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                            onEndReached={!isFetchingNextPage ? onEndReached : null}
                            renderItem={({ item }) => (
                                <View style={styles.listItem}>
                                    <View style={styles.avatar}>
                                        {isEmpty(get(item, "photoUrl")) ? (
                                            <Text style={styles.avatarText}>
                                                {get(item, "name", "").charAt(0).toUpperCase()}
                                            </Text>
                                        ) : (
                                            <Image source={{ uri: get(item, "photoUrl") }} style={styles.avatarImg} />
                                        )}
                                    </View>
                                    <Text style={styles.listTitle}>{get(item, "name")}</Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        style={styles.input}
                                        value={values[get(item, "id", "")] || "0"}
                                        onChangeText={(text) => {
                                            setFieldValue(get(item, "id", ""), text ? text : "0");
                                        }}
                                    />

                                </View>
                            )}
                            ListFooterComponent={
                                isFetchingNextPage ? (
                                    <View style={styles.footer}>
                                        <ActivityIndicator />
                                    </View>
                                ) : null
                            }
                        />

                        <View style={styles.footerContainer}>
                            <Button style={styles.stockButton} onPress={handleSubmit} isLoading={isPendingMutate}>
                                <Text style={styles.buttonText}>{t("Kiritish")}</Text>
                            </Button>
                        </View>
                    </>
                )}
            </Formik>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    headerTitle: {
        marginLeft: 20,
        fontWeight: "500",
        fontSize: 18,
    },
    container: {
        backgroundColor: "#F1F5F8",
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 60,
        flex: 1,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 12,
        marginBottom: 6,
    },
    avatar: {
        width: 55,
        height: 52,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#8E8E90",
        borderRadius: 10,
    },
    avatarImg: {
        width: 55,
        height: 52,
        borderRadius: 10,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "400",
    },
    listTitle: {
        marginLeft: 21,
        color: "#083346",
        fontSize: 16,
    },
    input: {
        marginLeft: "auto",
        width: 80,
        height: 52,
        borderWidth: 1,
        borderColor: "#8E8E90",
        borderRadius: 8,
        paddingHorizontal: 10,
        textAlign: "center",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
    },
    footerContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#fff",
        padding: 12,
        alignItems: "center",
    },
    stockButton: {
        backgroundColor: "#00C249",
        paddingVertical: 12,
        borderRadius: 6,
        width: "90%",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
    },
});
