import {
    FlatList, Image, Linking, Platform, Pressable,
    StyleSheet, Text,
    View,
} from "react-native";
import React from "react";
import useFetchRequest from "@/hooks/api/useFetchRequest";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import {get} from "lodash";
import Loader from "@/components/shared/Loader";

export default function PharmaciesScreen() {
    const { data, isPending } = useFetchRequest({
        queryKey: "pharmacies_list",
        endpoint: "api/app/pharmacies/"
    });
    if (isPending) return <Loader />;

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
                data={get(data, "content", [])}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={<ListEmptyComponent text={null}/>}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
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
                            <Image source={require('@/assets/icons/location.png')} width={20} height={20} />
                        </Pressable>
                    </View>
                )}
            />
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
    }
});
