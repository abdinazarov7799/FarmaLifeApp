import React, {useState} from "react";
import {View, Text, StyleSheet, Pressable, TouchableOpacity, Modal} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {useTranslation} from "react-i18next";
import {Button} from "native-base";

const FilterModal = ({isOpen,setIsOpen,setFrom,setTo}) => {
    const {t} = useTranslation();
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [openFrom, setOpenFrom] = useState(false);
    const [openTo, setOpenTo] = useState(false);

    const handleSave = () => {
        setFrom(fromDate.toISOString().split("T")[0])
        setTo(toDate.toISOString().split("T")[0])
        setIsOpen(false)
    };

    const handleClear = () => {
        setFrom(null)
        setTo(null)
        setIsOpen(false)
    };

    const handleSetCurrent = () => {
        setFromDate(new Date());
        setToDate(new Date());
    }
    return (
        <Modal visible={isOpen} transparent animationType="fade">
            <Pressable style={styles.modalContainer} onPress={() => setIsOpen(false)}>
                <View>
                    <View style={styles.container}>
                        <TouchableOpacity style={styles.input} onPress={() => setOpenFrom(true)}>
                            <Text style={styles.label}>{t("С")}:</Text>
                            <Text style={styles.label}>{fromDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.input} onPress={() => setOpenTo(true)}>
                            <Text style={styles.label}>{t("По")}:</Text>
                            <Text style={styles.label}>{toDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        <Button onPress={handleClear} style={styles.button2} variant={"unstyled"}>
                            <Text style={{fontSize: 16, lineHeight: 20,}}>{t("Tozalash")}</Text>
                        </Button>
                        <Button onPress={handleSave} style={styles.button}>
                            <Text style={styles.buttonText}>{t("Saqlash")}</Text>
                        </Button>
                    </View>

                    <Modal visible={openFrom} transparent animationType="fade">
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <DateTimePicker
                                    value={fromDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) {
                                            setFromDate(selectedDate);
                                        }
                                        setOpenFrom(false);
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>

                    <Modal visible={openTo} transparent animationType="fade">
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <DateTimePicker
                                    value={toDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) {
                                            setToDate(selectedDate);
                                        }
                                        setOpenTo(false);
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F1F5F8",
        paddingHorizontal: 16,
        paddingVertical: 24,
        borderRadius: 10
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
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)"
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center"
    },
    button: {
        width: "100%",
        paddingVertical: 12,
        backgroundColor: "#0C5591",
        borderRadius: 12,
        height: 44,
        alignItems: "center",
        marginTop: 10
    },
    button2: {
        width: "100%",
        paddingVertical: 12,
        borderRadius: 12,
        height: 44,
        alignItems: "center",
        marginTop: 10
    },
    buttonText: {
        fontSize: 16,
        lineHeight: 20,
        color: "white",
    },
});


export default FilterModal;
