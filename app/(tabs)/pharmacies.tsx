import {
    ActivityIndicator, Alert,
    FlatList, Linking, Modal, Platform, Pressable, RefreshControl,
    StyleSheet, Text, TouchableOpacity,
    View,
} from "react-native";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {get, isArray} from "lodash";
import Loader from "@/components/shared/Loader";
import {router, useNavigation} from "expo-router";
import SearchIcon from "@/assets/icons/search.svg";
import AddIcon from "@/assets/icons/add-circle.svg";
import LocationIcon from "@/assets/icons/location.svg";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";
import {Input} from "native-base";
import {useTranslation} from "react-i18next";
import useDeleteQuery from "@/hooks/api/useDeleteQuery";
import VisitIcon from "@/assets/icons/visit-icon.svg";
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import {BottomSheetModal} from "@gorhom/bottom-sheet";
import {BaseBottomSheet} from "@/components/shared/bottom-sheet";

export default function PharmaciesScreen() {
    const navigation = useNavigation();
    const [selected, setSelected] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [search, setSearch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(null);
    const [selectedMore,setSelectedMore] = useState(null);
    const sheetRef = useRef<BottomSheetModal>(null);
    const {t} = useTranslation()

    const {mutate,isPending} = useDeleteQuery({queryKey: [`pharmacies_list`]})

    const {data,isLoading ,isRefreshing, onRefresh, onEndReached, isFetchingNextPage} = useInfiniteScroll({
        key: "pharmacies_list",
        url: "api/app/pharmacies/",
        limit: 20,
        filters: {
            search
        }
    })
    //
    // useLayoutEffect(() => {
    //     navigation.setOptions({
    //         headerRight: () => (
    //             <TouchableOpacity style={{marginRight: 16}}>
    //                 <SearchIcon width={20} height={20} />
    //             </TouchableOpacity>
    //         )
    //     });
    // }, [navigation]);

    const handleDelete = (id:any) => {
        mutate({
            endpoint: `api/app/pharmacies/delete/${id}`,
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

    useEffect(() => {
       setSelected(null);
    },[])

    const handleNavigate = () => {
        router.push(`/pharmacy/${get(selected,'id')}?title=${get(selected,'name')}&inn=${get(selected,'inn')}`)
    }

    useEffect(() => {
        if (!!selected) {
            router.push(`/pharmacy/${get(selected,'id')}?title=${get(selected,'name')}&inn=${get(selected,'inn')}`);
        }
    }, [selected]);

    const handleOpenMap = async (lat:any, long:any) => {

        const yandexUrl = `yandexmaps://maps.yandex.com/?ll=${long},${lat}&z=15`;
        const googleAppUrl = `geo:${lat},${long}?q=${lat},${long}`;
        const googleWebUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
        try {
            await Linking.openURL(yandexUrl);
        } catch (error) {
            Linking.openURL(Platform.OS === 'ios' ? googleWebUrl : googleAppUrl).catch(() => {
                Linking.openURL(googleWebUrl);
            });
        }

    };

    // if (!!selected) return (
    //     <CameraScreen
    //         setPhotoUrl={(url:any) => setPhotoUrl(url)}
    //         onClose={() => {
    //             setSelected(null)
    //             setPhotoUrl(null)
    //         }}
    //         handleNavigate={handleNavigate}
    //         offlineSupport={true}
    //     />
    // )

    // if (isLoading) return <Loader />
    return (
        <View style={styles.container}>
            <View style={{ backgroundColor: '#fff', padding: 8, borderRadius: 999, marginBottom: 8 }}>
                <Input
                    variant="unstyled"
                    style={{ color: '#6b7280', fontSize: 15 }}
                    value={search}
                    placeholder={t("Dorixonani izlash")}
                    onChangeText={(text) => setSearch(text)}
                    InputLeftElement={
                        <SearchIcon width={20} height={20} />
                    }
                />
            </View>
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={<ListEmptyComponent text={null}/>}
                onEndReached={onEndReached}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listItem} onPress={() => setSelected(item)}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {"X"}
                            </Text>
                        </View>
                        <View style={styles.listInfo}>
                            <Text style={styles.listTitle}>{get(item,'name')}</Text>
                            <Text style={styles.listSubtitle}>INN: {get(item,'inn')}</Text>
                        </View>
                        <Pressable onPress={() => {
                            sheetRef.current?.present();
                            setSelectedMore(item)
                        }}>
                            <View style={{flex: 1}}>
                                <Feather name="more-horizontal" size={24} color="black" style={{margin: "auto"}} />
                            </View>
                        </Pressable>
                    </TouchableOpacity>
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
                    <TouchableOpacity style={[styles.button, {marginBottom: 16,backgroundColor: "#e4e4e4"}]} onPress={() => {
                        handleOpenMap(get(selectedMore,'lat'),get(selectedMore,'lng'))
                    }}>
                        <Text style={{fontSize: 16,marginRight: 10,fontWeight: 500}}>
                            {t("Location")}
                        </Text>
                        <LocationIcon width={24} height={24} style={{flex: 1}} />
                    </TouchableOpacity>
                    {
                        get(selectedMore,'author') && (
                            <View style={{flexDirection: "row",alignItems: "center"}}>
                                <TouchableOpacity style={[styles.button, {backgroundColor: "#DC5558",marginRight: 10}]} onPress={() => {
                                    setIsModalOpen(selectedMore)
                                    sheetRef.current?.dismiss();
                                }}>
                                    <AntDesign name="delete" size={24} color="white" />
                                    <Text style={styles.buttonText}>{t("Delete")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, {backgroundColor: "#dad832",marginLeft: 10}]} onPress={() => {
                                    router.push(`/pharmacy/edit?id=${get(selectedMore,'id')}`);
                                    sheetRef.current?.dismiss();
                                }}>
                                    <AntDesign name="edit" size={24} color="white" />
                                    <Text style={styles.buttonText}>{t("Edit")}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
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
                                {get(isModalOpen,'name')}
                            </Text>
                            <Text style={{fontWeight: 500,fontSize: 16,marginTop: 6,marginBottom:40}}>
                                {get(isModalOpen,'inn')}
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
            <Pressable style={styles.floatButton} onPress={() => router.push('/pharmacy/add')}>
                <AddIcon />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F8',
        paddingHorizontal: 16,
        paddingTop: 12,
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
        flex: 1,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: "400",
        color: "#000"
    },
    listSubtitle: {
        fontSize: 14,
        color: "#6B7280"
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
    footer: {
        flexDirection: "row",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
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
});
