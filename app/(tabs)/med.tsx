import {
    View,
    StyleSheet, Linking, Platform, FlatList, Text, Pressable, TouchableOpacity, RefreshControl, ActivityIndicator
} from "react-native";
import React, {useCallback, useEffect, useLayoutEffect} from "react";
import Loader from "@/components/shared/Loader";
import {get} from "lodash";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {router, useNavigation} from "expo-router";
import SearchIcon from "@/assets/icons/search.svg";
import AddIcon from "@/assets/icons/add-circle.svg";
import LocationIcon from "@/assets/icons/location.svg";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";

export default function MedScreen() {
    const navigation = useNavigation();

    const {data,isLoading ,isRefreshing, onRefresh, onEndReached, isFetchingNextPage} = useInfiniteScroll({
        key: "med_institution_list",
        url: "api/app/med-institution/",
        limit: 20
    })

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={{ marginRight: 16 }}>
                    <SearchIcon width={20} height={20} />
                </TouchableOpacity>
            )
        });
    }, [navigation]);

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

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                onEndReached={onEndReached}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<ListEmptyComponent text={null}/>}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listItem} onPress={() => router.push(`/med/${get(item,'id')}?title=${get(item,'name')}`)}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {get(item,'name[0]','')}
                            </Text>
                        </View>
                        <Text style={styles.listTitle}>{get(item,'name','')}</Text>
                        <Pressable style={{marginLeft: "auto"}} onPress={() => handleOpenMap(get(item,'lat'),get(item,'lng'))}>
                            <LocationIcon />
                        </Pressable>
                    </TouchableOpacity>
                )}
                ListFooterComponent={
                    <View style={styles.footer}>
                        {isFetchingNextPage && <ActivityIndicator />}
                    </View>
                }
            />
            <Pressable style={styles.floatButton} onPress={() => router.push('/med/add/pharmacy')}>
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
        fontSize: 18,
        fontWeight: "400",
        color: "#000"
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
});
