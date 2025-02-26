import {router, useLocalSearchParams} from "expo-router";
import {View, Text, StyleSheet, Pressable, SafeAreaView} from "react-native";
import React, {useState} from "react";
import CloseIcon from "@/assets/icons/close.svg";
import {useTranslation} from "react-i18next";
import useFetchRequest from "@/hooks/api/useFetchRequest";
import Loader from "@/components/shared/Loader";
import {get, isArray} from "lodash";
import dayjs from "dayjs";
import usePostQuery from "@/hooks/api/usePostQuery";

export default function PharmacyView() {
    const { id, title } = useLocalSearchParams();
    const {t} = useTranslation();
    const [selected, setSelected] = useState(null);

    const {data,isPending} = useFetchRequest({
        queryKey: `doctors/${id}`,
        endpoint: `api/app/doctors/${id}`,
        enabled: !!id
    })

    const {mutate,isPending:isPendingVisit} = usePostQuery({
        queryKey: `doctors/${id}`,
    })

    const visit = isArray(get(data, "content", [])) ? get(data, 'content', []) : [];

    if (isPending) return <Loader />;

    return (
        <SafeAreaView style={{flex: 1,backgroundColor: "#fff"}}>
            <View style={styles.header}>
                <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {title[0]}
                        </Text>
                    </View>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Pressable onPress={() => router.push("/pharmacies")}>
                    <CloseIcon />
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
        marginBottom: 5
    },
    title: {
        color: "#000",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 18.75,
        marginBottom: 5
    }
});
