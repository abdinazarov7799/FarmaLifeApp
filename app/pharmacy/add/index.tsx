import React, {useState} from "react";
import {View, Text, StyleSheet, Pressable, TouchableOpacity, TextInput, Image, Alert, Linking} from "react-native";
import {router} from "expo-router";
import {useTranslation} from "react-i18next";
// @ts-ignore
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import usePostQuery from "@/hooks/api/usePostQuery";
import useFetchRequest from "@/hooks/api/useFetchRequest";
import {get, isArray} from "lodash";
import { Formik } from "formik";
import * as Yup from "yup";
import * as Location from "expo-location";
import {Button, Select} from "native-base";
import CameraScreen from "@/components/camera";
import {SafeAreaView} from "react-native-safe-area-context";

export default function PharmacyAddScreen () {
    const {t} = useTranslation();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [location, setLocation] = useState(null);
    const [isOpenCamera, setIsOpenCamera] = useState(false);
    const [name, setName] = useState(null);
    const [inn,setInn] = useState(null);

    const {data:regions,isPending:isPendingRegions} = useFetchRequest({
        queryKey: "api/app/regions",
        endpoint: "api/app/regions/"
    })

    const {data:districts,isPending:isPendingDistricts} = useFetchRequest({
        queryKey: `api/app/districts/${selectedRegion}`,
        endpoint: `api/app/districts/${selectedRegion}`,
        enabled: !!selectedRegion,
    })

    const {mutate,isPending:isPending} = usePostQuery({})

    const getCurrentLocation = async () => {
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
        setLocation({ lat: locationData.coords.latitude, lng: locationData.coords.longitude });
    };
    // const validationSchema = Yup.object().shape({
    //     name: Yup.string().required("Dorixona nomi majburiy"),
    //     inn: Yup.string().required("INN nomi majburiy"),
    // });

    const onSubmit = (values) => {
        if (!name) {
            return Alert.alert(t("Xatolik"), t("Iltimos, dorixona nomini kiriting."));
        }
        if (!inn) {
            return Alert.alert(t("Xatolik"), t("Iltimos, inn kiriting."));
        }
        if (!photoUrl) {
            return Alert.alert(t("Xatolik"), t("Iltimos, rasmini yuklang."));
        }
        if (!location) {
            return Alert.alert(t("Xatolik"), t("Iltimos, joylashuvni kiriting."));
        }
        mutate({
            endpoint: 'api/app/pharmacies/add',
            attributes: {
                name,
                districtId: selectedDistrict,
                photoUrl: photoUrl,
                inn,
                lat: get(location,'lat'),
                lng: get(location,'lng'),
            }
        }, {
            onSuccess: (res) => {
                Alert.alert(t("Ajoyib"), t("Muvofaqqiyatli saqlandi"));
                router.back();
            },
            onError: (error) => {
                const messages = get(error,'response.data.errors',[])
                if (isArray(messages)){
                    messages?.forEach(message=> {
                        Alert.alert(t(get(message,'errorMsg','Xatolik')));
                    })
                }
            }
        });
    }

    if (isOpenCamera) return <CameraScreen
        setPhotoUrl={(url) => {
        setPhotoUrl(url);
        setIsOpenCamera(false);
    }}
        onClose={() => {
            setIsOpenCamera(false)
            setPhotoUrl(null);
        }} />

    return (
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <View style={{display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 22}}>
                    <Pressable onPress={() => router.back()}>
                        <ArrowLeft width={24} height={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t("Dorixona qo’shish")}</Text>
                </View>
                <View style={{display: "flex",flexDirection: "row",alignItems: "center", justifyContent: "space-between"}}>
                    <View style={{display: "flex",flexDirection: "row", alignItems: "center", gap: 10}}>
                        <View style={{width: 14,height: 14, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                        <Text style={{fontSize: 14, lineHeight: 17}}>{t("Majburiy to’ldirish")}</Text>
                    </View>
                    <View style={{display: "flex",flexDirection: "row", alignItems: "center", gap: 10}}>
                        <View style={{width: 14,height: 14, backgroundColor: "#dddddd", borderRadius: "50%"}}></View>
                        <Text style={{fontSize: 14, lineHeight: 17}}>{t("Ixtiyoriy to’ldirish")}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.container}>
                <Formik
                    initialValues={{}}
                    // validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <View style={{ flex: 1 }}>
                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                <Text style={styles.label}>{t("Region")}</Text>
                            </View>
                            <View style={styles.selectBox}>
                                <Select
                                    style={styles.select}
                                    selectedValue={selectedRegion}
                                    variant={"unstyled"}
                                    onValueChange={(itemValue, itemIndex) => {
                                        setSelectedRegion(itemValue)
                                        setSelectedDistrict(null)
                                    }}>
                                    {
                                        isArray(regions) && (
                                            regions?.map(region => {
                                                return (
                                                    <Select.Item
                                                        label={get(region,'name')}
                                                        value={get(region,'id')}
                                                        key={get(region,'id')}
                                                    />
                                                )
                                            })
                                        )
                                    }
                                </Select>
                            </View>

                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                <Text style={styles.label}>{t("Tuman")}</Text>
                            </View>
                            <View style={styles.selectBox}>
                                <Select
                                    style={styles.select}
                                    selectedValue={selectedDistrict}
                                    variant={"unstyled"}
                                    onValueChange={(itemValue, itemIndex) =>
                                        setSelectedDistrict(itemValue)
                                    }>
                                    {
                                        isArray(districts) && (
                                            districts?.map(district => (
                                                <Select.Item label={get(district,'name')} value={get(district,'id')} key={get(district,'id')} />
                                            ))
                                        )
                                    }
                                </Select>
                            </View>

                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                <Text style={styles.label}>{t("Dorixona nomi")}</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder={t("Dorixona nomi")}
                                value={name}
                                onChangeText={(text) => {
                                    const onChange = handleChange("name")
                                    onChange(text)
                                    setName(text)
                                }}
                                onBlur={handleBlur("name")}
                            />
                            {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                <Text style={styles.label}>{t("INN")}</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder={t("INN")}
                                value={inn}
                                onChangeText={(value) => {
                                    const onChange = handleChange("inn")
                                    onChange(value)
                                    setInn(value)
                                }}
                                onBlur={handleBlur("inn")}
                            />
                            {touched.inn && errors.inn && <Text style={styles.errorText}>{errors.inn}</Text>}


                            <View style={{display: "flex",flexDirection: "row", alignItems: "center", justifyContent: "space-between",marginBottom: 20}}>
                                <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                    <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                    <Text style={styles.label}>{t("Dorixona rasmini kiriting")}</Text>
                                </View>
                                <TouchableOpacity style={styles.button} onPress={() => setIsOpenCamera(true)}>
                                    <Text style={styles.buttonText}>{t("Kiritish")}</Text>
                                </TouchableOpacity>
                            </View>
                            {photoUrl && <Image source={{ uri: photoUrl }} style={styles.image} />}

                            <View style={{display: "flex",flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                                <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                    <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                    <Text style={styles.label}>{t("Dorixona joylashuvini kiriting")}</Text>
                                </View>
                                <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                                    <Text style={styles.buttonText}>{t("Kiritish")}</Text>
                                </TouchableOpacity>
                            </View>
                            {location && (
                                <Text style={styles.locationText}>
                                    Latitude: {location.lat}, Longitude: {location.lng}
                                </Text>
                            )}

                            <Button style={styles.submitButton} onPress={handleSubmit} isLoading={isPending}>
                                <Text style={styles.submitButtonText}>{t("Saqlash")}</Text>
                            </Button>
                        </View>
                    )}
                </Formik>
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
    statusContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statusItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    greenDot: {
        width: 14,
        height: 14,
        backgroundColor: "#00C249",
        borderRadius: 7,
    },
    grayDot: {
        width: 14,
        height: 14,
        backgroundColor: "#dddddd",
        borderRadius: 7,
    },
    statusText: {
        fontSize: 14,
        lineHeight: 17,
    },
    label: {
        fontSize: 14,
        fontWeight: 400,
        marginLeft: 7,
        color: "#000",
        lineHeight: 17
    },
    input: {
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        lineHeight: 20,
        backgroundColor: "#FFF",
        marginTop: 6,
        marginBottom: 24
    },
    button: {
        backgroundColor: "#0C5591",
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 18
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginBottom: 5,
    },
    locationText: {
        marginTop: 5,
        color: "#555",
    },
    submitButton: {
        marginTop: "auto",
        backgroundColor: "#0C5591",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#FFF",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: 400,
    },
    errorText: {
        color: "red",
        fontSize: 12,
    },
    selectBox: {
        backgroundColor: "#FFF",
        marginTop: 6,
        marginBottom: 24,
        borderRadius: 12,
    },
    select: {
        height: 44,
        fontSize: 16,
        lineHeight: 20,
    },
});
