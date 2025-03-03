import {
    ActivityIndicator,
    FlatList, Linking, Platform, Pressable, RefreshControl,
    StyleSheet, Text, TouchableOpacity,
    View,
} from "react-native";
import React, {useEffect, useState} from "react";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {get} from "lodash";
import Loader from "@/components/shared/Loader";
import {router, useNavigation} from "expo-router";
import SearchIcon from "@/assets/icons/search.svg";
import AddIcon from "@/assets/icons/add-circle.svg";
import LocationIcon from "@/assets/icons/location.svg";
import CameraScreen from "@/components/camera";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll";

export default function PharmaciesScreen() {
    const navigation = useNavigation();
    const [selected, setSelected] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(null);

    const {data,isLoading ,isRefreshing, onRefresh, onEndReached, isFetchingNextPage} = useInfiniteScroll({
        key: "pharmacies_list",
        url: "api/app/pharmacies/",
        limit: 20
    })

    useEffect(() => {
       setSelected(null);
       setPhotoUrl(null);
    },[])

    const handleNavigate = (compressedUri) => {
        router.push(`/pharmacy/${get(selected,'id')}?photoUrl=${compressedUri}&title=${get(selected,'name')}&inn=${get(selected,'inn')}`)
    }

    useEffect(() => {
        if (!!selected && !!photoUrl) {
            router.push(`/pharmacy/${get(selected,'id')}?photoUrl=${photoUrl}&title=${get(selected,'name')}&inn=${get(selected,'inn')}`);
        }
    }, [selected,photoUrl]);

    navigation.setOptions({
        headerRight: () => (
            <TouchableOpacity onPress={() => router.navigate('/filter?redirect=/pharmacies')} style={{marginRight: 16}}>
                <SearchIcon width={20} height={20} />
            </TouchableOpacity>
        )
    });

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

    if (!!selected) return (
        <CameraScreen
            setPhotoUrl={(url:any) => setPhotoUrl(url)}
            onClose={() => setSelected(null)}
            handleNavigate={handleNavigate}
            offlineSupport={true}
        />
    )

    return (
        <View style={styles.container}>
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
                        <Pressable onPress={() => handleOpenMap(get(item,'lat'),get(item,'lng'))}>
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
});
