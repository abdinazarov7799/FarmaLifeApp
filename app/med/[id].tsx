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
    ActivityIndicator
} from "react-native";
import React, {useState} from "react";
import CloseIcon from "@/assets/icons/close.svg";
import {useTranslation} from "react-i18next";
import Loader from "@/components/shared/Loader";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {get} from "lodash";
import AddIcon from "@/assets/icons/add-circle.svg";
import VisitIcon from "@/assets/icons/visit-icon.svg";
import dayjs from "dayjs";
import usePostQuery from "@/hooks/api/usePostQuery";
import {SafeAreaView} from "react-native-safe-area-context";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";
import {useAuthStore, useNetworkStore} from "@/store";

export default function MedView() {
    const { id, title } = useLocalSearchParams();
    const {t} = useTranslation();
    const [selected, setSelected] = useState(null);
    const {addToOfflineVisits} = useAuthStore();
    const {isOnline} = useNetworkStore()

    const {data,isLoading ,isRefreshing, onRefresh, onEndReached, isFetchingNextPage} = useInfiniteScroll({
        key: `doctors/${id}`,
        url: `api/app/doctors/${id}`,
        limit: 20
    })

    const {mutate,isPending:isPendingVisit} = usePostQuery({
        queryKey: `doctors/${id}`,
    })

    const handleVisit = () => {

        if (isOnline) {
            mutate({
                endpoint: `api/app/doctors/visit/${get(selected,'id')}?createdTime=${dayjs().unix()}`
            }, {
                onSuccess: (res) => {
                    setSelected(null);
                },
                onError: (e) => {
                }
            });
        }else {
            addToOfflineVisits({
                id: get(selected,'id'),
                createdTime: dayjs().unix(),
            });
            setSelected(null);
        }
    }
    if (isLoading || isPendingVisit) return <Loader />;

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
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={onEndReached}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<ListEmptyComponent text={null}/>}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.listItem} onPress={() => setSelected(item)}>
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
                        </TouchableOpacity>
                    )}
                    ListFooterComponent={
                        <View style={styles.footer}>
                            {isFetchingNextPage && <ActivityIndicator />}
                        </View>
                    }
                />
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
                                    {get(selected,'position')}
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
