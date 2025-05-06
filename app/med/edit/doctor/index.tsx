import React from "react";
import {View, Text, StyleSheet, Pressable, TextInput, TouchableOpacity, Image, Alert} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import {useTranslation} from "react-i18next";
// @ts-ignore
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import {Formik} from "formik";
import * as Yup from "yup";
import usePostQuery from "@/hooks/api/usePostQuery";
import {Button} from "native-base";
import {get, isArray} from "lodash";
import usePatchQuery from "@/hooks/api/usePatchQuery";
import useFetchRequest from "@/hooks/api/useFetchRequest";

export default function PharmacyAddScreen () {
    const {t} = useTranslation();
    const { id, medInstitutionId } = useLocalSearchParams();

    const validationSchema = Yup.object().shape({
        fio: Yup.string().required('sdasd'),
        position: Yup.string().required(),
        phone: Yup.string().required(),
        specialization: Yup.string().required(),
        secondPlaceOfWork: Yup.string().required(),
    });

    const {data,isPending} = useFetchRequest({
        queryKey: `api/app/doctors/${id}`,
        endpoint: `api/app/doctors/get/${id}`,
        enabled: !!id,
    })

    const {mutate,isPending:isPendingPost} = usePatchQuery({})

    const onSubmit = (values:any) => {
        mutate({
            endpoint: `api/app/doctors/edit/${id}`,
            attributes: {
                medInstitutionId,
                ...values
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

    return (
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <View style={{display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 22}}>
                    <Pressable onPress={() => router.back()}>
                        <ArrowLeft width={24} height={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{get(data,'fio')}</Text>
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
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                    enableReinitialize
                    initialValues={{
                        fio: get(data, 'fio', ''),
                        position: get(data, 'position', ''),
                        phone: get(data, 'phone', ''),
                        specialization: get(data, 'specialization', ''),
                        secondPlaceOfWork: get(data, 'secondPlaceOfWork', ''),
                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <View style={{ flex: 1 }}>
                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                <Text style={styles.label}>{t("FIO")}</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="FIO"
                                value={values.fio}
                                onChangeText={handleChange("fio")}
                                onBlur={handleBlur("fio")}
                            />
                            {touched.fio && errors.fio && <Text style={styles.errorText}>{errors.fio}</Text>}

                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                <Text style={styles.label}>{t("Lavozimi")}</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder={t("Lavozimi")}
                                value={values.position}
                                onChangeText={handleChange("position")}
                                onBlur={handleBlur("position")}
                            />
                            {touched.position && errors.position && <Text style={styles.errorText}>{errors.position}</Text>}

                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                <Text style={styles.label}>{t("Ixtisos")}</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder={t("Ixtisosni kiriting")}
                                value={values.specialization}
                                onChangeText={handleChange("specialization")}
                                onBlur={handleBlur("specialization")}
                            />
                            {touched.specialization && errors.specialization && <Text style={styles.errorText}>{errors.specialization}</Text>}

                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                <Text style={styles.label}>{t("Second place of work")}</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder={t("Second place of work")}
                                value={values.secondPlaceOfWork}
                                onChangeText={handleChange("secondPlaceOfWork")}
                                onBlur={handleBlur("secondPlaceOfWork")}
                            />
                            {touched.secondPlaceOfWork && errors.secondPlaceOfWork && <Text style={styles.errorText}>{errors.secondPlaceOfWork}</Text>}

                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View style={{width: 7,height: 7, backgroundColor: "#00C249", borderRadius: "50%"}}></View>
                                <Text style={styles.label}>{t("Telefon raqami")}</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="+998"
                                value={values.phone}
                                onChangeText={handleChange("phone")}
                                onBlur={handleBlur("phone")}
                            />
                            {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                            <Button style={styles.submitButton} onPress={handleSubmit} isLoading={isPendingPost}>
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
});
