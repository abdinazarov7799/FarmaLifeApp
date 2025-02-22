import React, {useState} from "react";
import {View, Text, Button, StyleSheet, TextInput, Modal, Image, Pressable, TouchableOpacity} from "react-native";
import DatePicker from "react-native-date-picker";
import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {useTranslation} from "react-i18next";
// @ts-ignore
import ArrowLeft from "@/assets/icons/arrow-left.svg";

const FilterScreen = () => {
    const navigation = useNavigation();
    const {redirect} = useLocalSearchParams()
    const {t} = useTranslation();
    const [fromDate, setFromDate] = useState('01-мая-2022');
    const [toDate, setToDate] = useState('13-мая-2022');
    const [openFrom, setOpenFrom] = useState(false);
    const [openTo, setOpenTo] = useState(false);

    const handleSave = (from:any, to:any) => {

    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <Pressable onPress={() => router.push(redirect ?? "/")}>
                    <ArrowLeft width={24} height={24} />
                </Pressable>
                <Text style={styles.headerTitle}>{t("Filtr")}</Text>
                <Text style={styles.headerText}>{t("Joriy oy")}</Text>
            </View>
            <View style={styles.container}>
                <TouchableOpacity style={styles.input}>
                    <Text style={styles.label}>{t("С")}:</Text>
                    <Text style={styles.label}>{fromDate}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.input}>
                    <Text style={styles.label}>{t("По")}:</Text>
                    <Text style={styles.label}>{toDate}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F1F5F8",
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 60,
        flex: 1
    },
    header: {
        height: 46,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    headerTitle: {
        marginLeft: 20,
        fontWeight: 500,
        fontSize: 18,
        lineHeight: 21.09
    },
    headerText: {
        marginLeft: 'auto',
        fontWeight: 400,
        fontSize: 16,
        lineHeight: 18.75,
        color: '#0C5591'
    },
    label: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 19.36,
        color: "#0C5591",
        marginRight: 24
    },
    text: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 19.36,
        color: "#0C5591",
        marginRight: 24
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: "#FFF",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12
    },
});


export default FilterScreen;
