import {router, useLocalSearchParams} from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl, Modal, Alert
} from "react-native";
import React, {useState} from "react";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import FilterIcon from "@/assets/icons/filter.svg";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {get, isArray} from "lodash";
import dayjs from "dayjs";
import {SafeAreaView} from "react-native-safe-area-context";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";
import FilterModal from "@/components/filter";
import Loader from "@/components/shared/Loader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import VisitIcon from "@/assets/icons/visit-icon.svg";
import {useTranslation} from "react-i18next";
import useDeleteQuery from "@/hooks/api/useDeleteQuery";

export default function HistoryView() {
    const { id, title } = useLocalSearchParams();
    const {t} = useTranslation();
    const [from,setFrom] = useState(null)
    const [to,setTo] = useState(null)
    const [isOpen,setIsOpen] = useState(false);
    const [selected,setSelected] = useState(null);

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

    const {mutate,isPending} = useDeleteQuery({queryKey: [`get-visit-details/${id}`]})

    const handleDelete = () => {
        mutate({
            endpoint: `api/app/doctors/delete/visit/${get(selected,'id')}`,
        },{
            onSuccess: () => {
                setSelected(null);
                Alert.alert(t("Ajoyib"), t("Muvofaqqiyatli o'chirildi"));
            },
            onError: (error) => {
                const messages = get(error,'response.data.errors',[])
                console.log(messages,'error')
                setSelected(null);
                if (isArray(messages)){
                    messages?.forEach(message=> {
                        Alert.alert(t(get(message,'errorMsg','Xatolik')))
                    })
                }
            }
        })
    }

    if (isLoading || isPending) {
        return <Loader />
    }
    return (
        <SafeAreaView style={{flex: 1,backgroundColor: "#fff"}}>
            <View style={styles.header}>
                <Pressable onPress={() => router.push("/history?tab=visits")}>
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
                        return (
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
                                <View style={{alignItems: "flex-end"}}>
                                    <Text style={styles.timeText}>{dayjs(get(item,'createdAt')).format("DD.MM.YYYY HH:mm")}</Text>
                                    {get(item,'author',false) && (
                                        <Pressable onPress={() => setSelected(item)}>
                                            <MaterialIcons name="delete" size={24} color="red" />
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        )
                    }}
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
                                    {get(selected,'position')} • {get(selected,'specialization')}
                                </Text>
                                <Text style={{fontWeight: 500,fontSize: 16,marginTop: 6,marginBottom:40}}>
                                    {get(selected,'phone')}
                                </Text>
                                <View style={{display: "flex",flexDirection: "row",marginLeft: "auto",alignItems: "center"}}>
                                    <Pressable onPress={handleDelete}>
                                        <Text style={{color: "#ca1010",fontWeight: 600,fontSize: 16,marginRight: 41}}>
                                            {t("O'chirish")}
                                        </Text>
                                    </Pressable>
                                    <Pressable onPress={() => setSelected(null)}>
                                        <Text style={{color: "#0C5591",fontWeight: 400,fontSize: 16}}>
                                            {t("Orqaga qaytish")}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </Modal>
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
        lineHeight: 14,
        marginBottom: 10
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
