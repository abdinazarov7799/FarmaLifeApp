import {router, useLocalSearchParams} from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    FlatList,
    Modal,
    RefreshControl,
    ActivityIndicator, Alert, Linking
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import CloseIcon from "@/assets/icons/close.svg";
import {useTranslation} from "react-i18next";
import Loader from "@/components/shared/Loader";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {get, isArray, isNil, isNull} from "lodash";
import AddIcon from "@/assets/icons/add-circle.svg";
import VisitIcon from "@/assets/icons/visit-icon.svg";
import dayjs from "dayjs";
import usePostQuery from "@/hooks/api/usePostQuery";
import {SafeAreaView} from "react-native-safe-area-context";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";
import {useAuthStore} from "@/store";
import CheckIcon from "@/assets/icons/check.svg";
import DoubleCheckIcon from "@/assets/icons/check-icon.svg";
import * as Location from "expo-location";
import * as Network from "expo-network";
import useDeleteQuery from "@/hooks/api/useDeleteQuery";
import {BottomSheetModal} from "@gorhom/bottom-sheet";
import Feather from "@expo/vector-icons/Feather";
import {BaseBottomSheet} from "@/components/shared/bottom-sheet";
import LocationIcon from "@/assets/icons/location.svg";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function MedView() {
    const { id, title } = useLocalSearchParams();
    const {t} = useTranslation();
    const [selected, setSelected] = useState(null);
    const {addToOfflineVisits} = useAuthStore();
    const [isOnline, setIsOnline] = useState(true);
    const [selectedMore,setSelectedMore] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(null);
    const sheetRef = useRef<BottomSheetModal>(null);

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


    const {data,isLoading,isRefreshing, onRefresh, onEndReached, isFetchingNextPage, totalElements} = useInfiniteScroll({
        key: `doctors/${id}`,
        url: `api/app/doctors/${id}`,
        limit: 20
    })

    const {mutate,isPending:isPendingVisit} = usePostQuery({
        queryKey: `doctors/${id}`,
    })

    const {mutate:mutateDelete,isPending} = useDeleteQuery({queryKey: [`doctors/${id}`]})

    const handleDelete = (id:any) => {
        mutateDelete({
            endpoint: `api/app/doctors/delete/${id}`,
        },{
            onSuccess: () => {
                Alert.alert(t("Ajoyib"), t("Muvofaqqiyatli o'chirildi"));
                setIsModalOpen(false)
            },
            onError: (error) => {
                setIsModalOpen(false)
                const messages = get(error,'response.data.errors',[])
                if (isArray(messages)){
                    messages?.forEach(message=> {
                        Alert.alert(t(get(message,'errorMsg','Xatolik')))
                    })
                }
            }
        })
    }

    const handleVisit = async () => {
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

        if (isOnline) {
            mutate({
                endpoint: `api/app/doctors/visit/${get(selected,'id')}?createdTime=${dayjs().unix()}&lat=${locationData.coords.latitude}&lng=${locationData.coords.longitude}`
            }, {
                onSuccess: (res) => {
                    console.log(res,'res')
                    Alert.alert(t("Ajoyib"), t("Muvofaqqiyatli visit qilindi"));
                    setSelected(null);
                },
                onError: (e) => {
                    const messages = get(e,'response.data.errors',[])
                    if (isArray(messages)){
                        messages?.forEach(message=> {
                            Alert.alert(t(get(message,'errorMsg','Xatolik')));
                        })
                    }
                    setSelected(null);
                }
            });
        }else {
            addToOfflineVisits({
                id: get(selected,'id'),
                createdTime: dayjs().unix(),
                lat: locationData.coords.latitude,
                lng: locationData.coords.longitude
            });
            Alert.alert(t("Diqqat!"), t("Visitlar offline rejimda saqlandi. Internet qaytganda yuklanadi."));
            setSelected(null);
        }
    }
    if (isLoading || isPendingVisit) return <Loader />;

    const isToday = (dateTime) => {
        return dayjs(dateTime).isToday()
    }

    return (
        <SafeAreaView style={{flex: 1,backgroundColor: "#fff"}}>
            <View style={styles.header}>
                <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <View style={styles.avatar1}>
                        <Text style={styles.avatarText}>
                            {title[0]}
                        </Text>
                    </View>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Pressable onPress={() => router.push("/med")}>
                    <CloseIcon />
                </Pressable>
            </View>

            <View style={styles.container}>
                <View style={{justifyContent: 'flex-end',display: "flex",flexDirection: "row", marginVertical: 6}}>
                    <Text style={{fontSize: 14}}>
                        {t("Miqdori")}: {totalElements}
                    </Text>
                </View>
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={onEndReached}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<ListEmptyComponent text={null}/>}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <TouchableOpacity onPress={() => setSelected(item)} style={{flexDirection: "row", alignItems: "center",flex: 8}}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {get(item,'fio[0]','')}
                                    </Text>
                                </View>
                                <View style={styles.listInfo}>
                                    <Text style={styles.listTitle}>{get(item,'fio')}</Text>
                                    <Text style={styles.listSubtitle}>{get(item,'position')} • {get(item,'specialization')}</Text>
                                    <Text style={styles.listSubtitle2}>{get(item,'phone')}</Text>
                                </View>
                            </TouchableOpacity>
                            {
                                !isNil(get(item,'visitedTime')) &&
                                (isToday(get(item,'visitedTime')) ? <DoubleCheckIcon /> : <CheckIcon />)
                            }
                            {
                                get(item,'author') && (
                                    <Pressable onPress={() => {
                                        sheetRef.current?.present();
                                        setSelectedMore(item)
                                    }}
                                               style={{flex: 1,marginLeft: 10}}
                                    >
                                        <View>
                                            <Feather name="more-horizontal" size={24} color="black" style={{margin: "auto"}} />
                                        </View>
                                    </Pressable>
                                )
                            }
                        </View>
                    )}
                    ListFooterComponent={
                        <View style={styles.footer}>
                            {isFetchingNextPage && <ActivityIndicator />}
                        </View>
                    }
                />
                <BaseBottomSheet
                    bottomSheetRef={sheetRef}
                    snap={"25%"}
                    backgroundColor="#F5F6F7"
                >
                    <View style={{padding: 16,marginBottom: 16}}>
                        <View style={{flexDirection: "row",alignItems: "center"}}>
                            <TouchableOpacity style={[styles.button, {backgroundColor: "#DC5558",marginRight: 10}]} onPress={() => {
                                setIsModalOpen(selectedMore)
                                sheetRef.current?.dismiss();
                            }}>
                                <AntDesign name="delete" size={24} color="white" />
                                <Text style={styles.buttonText}>{t("Delete")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, {backgroundColor: "#dad832",marginLeft: 10}]} onPress={() => {
                                router.push(`/med/edit/doctor?id=${get(selectedMore,'id')}&medInstitutionId=${id}`);
                                sheetRef.current?.dismiss();
                            }}>
                                <AntDesign name="edit" size={24} color="white" />
                                <Text style={styles.buttonText}>{t("Edit")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BaseBottomSheet>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={!!isModalOpen}
                >
                    <Pressable style={styles.overlay} onPress={() => setIsModalOpen(null)}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <VisitIcon />
                                <Text style={{fontWeight: 500,fontSize: 22,marginTop: 16,marginBottom:6}}>
                                    {get(isModalOpen,'fio')}
                                </Text>
                                <Text style={{fontWeight: 500,fontSize: 16}}>
                                    {get(isModalOpen,'position')} • {get(isModalOpen,'specialization')}
                                </Text>
                                <Text style={{fontWeight: 500,fontSize: 16,marginTop: 6,marginBottom:40}}>
                                    {get(isModalOpen,'phone')}
                                </Text>
                                <View style={{display: "flex",flexDirection: "row",marginLeft: "auto",alignItems: "center"}}>
                                    <Pressable onPress={() => handleDelete(get(isModalOpen,'id'))}>
                                        <Text style={{color: "#ca1010",fontWeight: 600,fontSize: 16,marginRight: 41}}>
                                            {t("O'chirish")}
                                        </Text>
                                    </Pressable>
                                    <Pressable onPress={() => setIsModalOpen(null)}>
                                        <Text style={{color: "#0C5591",fontWeight: 400,fontSize: 16}}>
                                            {t("Orqaga qaytish")}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </Modal>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={!!selected}
                >
                    <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <VisitIcon />
                                <Text style={{fontWeight: 500,fontSize: 22,marginTop: 16,marginBottom:6}}>
                                    {get(selected,'fio')}
                                </Text>
                                <Text style={{fontWeight: 500,fontSize: 16}}>
                                    {get(selected,'position')} • {get(selected,'specialization')}
                                </Text>
                                <Text style={{fontWeight: 500,fontSize: 16,marginTop: 6,marginBottom:40}}>
                                    {get(selected,'phone')}
                                </Text>
                                <View style={{display: "flex",flexDirection: "row",marginLeft: "auto",alignItems: "center"}}>
                                    <Pressable onPress={() => setSelected(null)}>
                                        <Text style={{color: "#0C5591",fontWeight: 400,fontSize: 16,marginRight: 41}}>
                                            {t("Orqaga qaytish")}
                                        </Text>
                                    </Pressable>
                                    <Pressable onPress={handleVisit}>
                                        <Text style={{color: "#14AE5C",fontWeight: 600,fontSize: 16}}>
                                            {t("Vizit qilish")}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </Modal>
                <Pressable style={styles.floatButton} onPress={() => router.push(`/med/add/doctor?id=${id}`)}>
                    <AddIcon />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F1F5F8",
        paddingHorizontal: 16,
        flex: 1
    },
    header: {
        height: 55,
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
    button: {
        flex: 1,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 10,
        fontWeight: "500"
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
    avatar1: {
        width: 42,
        height: 42,
        borderRadius: '50%',
        backgroundColor: "#7B85CC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        marginBottom: 5
    },
    title: {
        color: "#000",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 18.75,
        marginBottom: 5
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
    floatButton: {
        position: "absolute",
        right: 16,
        bottom: 40,
        width: 52,
        height: 52,
        backgroundColor: "#0C5591",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    footer: {
        flexDirection: "row",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
    },
});
