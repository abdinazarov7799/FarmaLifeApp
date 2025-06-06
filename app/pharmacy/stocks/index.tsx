import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    RefreshControl,
    ActivityIndicator,
    FlatList,
    TextInput, Alert, Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import usePostQuery from "@/hooks/api/usePostQuery";
import dayjs from "dayjs";
import {get, isArray, isEmpty, isNil} from "lodash";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Button } from "native-base";
import { Formik } from "formik";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {AntDesign} from "@expo/vector-icons";
import {useAuthStore} from "@/store";
import * as Network from "expo-network";
import * as Location from "expo-location";

export default function StocksAddScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const {addToOfflineStocks} = useAuthStore();
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     const checkNetworkStatus = async () => {
    //         const networkState = await Network.getNetworkStateAsync();
    //         setIsOnline(networkState.isConnected);
    //     };
    //     checkNetworkStatus();
    //
    //     const unsubscribe = Network.addNetworkStateListener((networkState) => {
    //         setIsOnline(networkState.isConnected);
    //     });
    //
    //     return () => {
    //         unsubscribe.remove();
    //     };
    // }, []);

    const { data, isLoading, isRefreshing, onRefresh, onEndReached, isFetchingNextPage } = useInfiniteScroll({
        key: `drugs`,
        url: `api/app/drugs/get-all`,
        limit: 1000,
    });

    const { mutate, isPending: isPendingMutate } = usePostQuery({});
    console.log(isPendingMutate,'isPendingMutate')
    const onSubmit = async (values) => {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            Alert.alert(
                t("Lokatsiya ruxsati talab qilinadi"),
                t("Ilova lokatsiyani ishlatish uchun ruxsat so‘raydi. Ruxsat bermoqchimisiz?"),
                [
                    { text: t("Bekor qilish"), style: "cancel" },
                    { text: t("Sozlamalarga o‘tish"), onPress: () => Linking.openSettings() }
                ]
            );
            return;
        }

        const locationData = await Location.getCurrentPositionAsync({});

        const drugsArray = data?.map(item => {
            return {
                drugId: get(item,'id'),
                quantity: isNil(get(values,`${get(item,'id')}`)) ? 0 : get(values,`${get(item,'id')}`)
            }
        })

        if (isOnline) {
            mutate(
                {
                    endpoint: "api/app/stocks/add",
                    attributes: {
                        pharmacyId: id,
                        createdTime: dayjs().unix(),
                        drugs: drugsArray,
                        lat: locationData.coords.latitude,
                        lng: locationData.coords.longitude
                    },
                },
                {
                    onSuccess: () => {
                        setLoading(false);
                        Alert.alert(t("Ajoyib"), t("Muvofaqqiyatli saqlandi"));
                        },
                    onError: (error) => {
                        setLoading(false);
                        const messages = get(error,'response.data.errors',[])
                        if (isArray(messages)){
                            messages?.forEach(message=> {
                                Alert.alert(t(get(message,'errorMsg','Xatolik')));
                            })
                        }
                    }
                }
            );
        } else {
            addToOfflineStocks({
                pharmacyId: id,
                createdTime: dayjs().unix(),
                photoUrl: photoUrl,
                drugs: drugsArray,
                lat: locationData.coords.latitude,
                lng: locationData.coords.longitude
            });
            Alert.alert(t("Diqqat!"),t("Dorilar offline rejimda saqlandi. Internet qaytganda yuklanadi."));
            router.push("/pharmacies");
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F1F5F8", paddingBottom: 70 }}>
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

                                    <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 5 }}>
                                        <Button
                                            style={styles.controlButton}
                                            shadow={"1"}
                                            onPress={() => {
                                                const currentValue = Number(values[get(item, "id", "")]) || 0;
                                                if (currentValue > 0) {
                                                    setFieldValue(get(item, "id", ""), currentValue - 1);
                                                }
                                            }}
                                        >
                                            <AntDesign name="minus" size={12} color="black" />
                                        </Button>

                                        <TextInput
                                            keyboardType="number-pad"
                                            style={styles.input}
                                            value={(values[get(item, "id", "")] || "0").toString()}
                                            onChangeText={(text) => {
                                                const newValue = text.replace(/[^0-9]/g, "");
                                                setFieldValue(get(item, "id", ""), newValue === "" ? "0" : Number(newValue));
                                            }}
                                        />

                                        <Button
                                            style={styles.controlButton}
                                            shadow={"1"}
                                            onPress={() => {
                                                const currentValue = Number(values[get(item, "id", "")]) || 0;
                                                setFieldValue(get(item, "id", ""), currentValue + 1);
                                            }}
                                        >
                                            <AntDesign name="plus" size={12} color="black" />
                                        </Button>
                                    </View>


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
                            <Button style={styles.stockButton} onPress={handleSubmit} isLoading={loading} isDisabled={loading} >
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
        marginBottom: 3
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
        padding: 12,
        marginVertical: 3,
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
        flex: 1
    },
    input: {
        width: 60,
        height: 32,
        borderWidth: 1,
        borderColor: "#8E8E90",
        borderRadius: 8,
        marginStart: 5,
        marginEnd: 5,
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
    controlButton: {
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
    },
});
