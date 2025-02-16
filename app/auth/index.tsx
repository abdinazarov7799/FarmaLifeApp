import React, {useState} from 'react';
import { View, Text, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { identifySchema } from "@/lib/validation";
import {Button} from 'native-base';
import MaskInput from 'react-native-mask-input';
import { useTranslation } from "react-i18next";
import usePostQuery from "@/hooks/api/usePostQuery";
import {get, isEqual, isNull} from "lodash";

const Index = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { mutate, isPending } = usePostQuery({});
    const [errorStatus, setErrorStatus] = useState(null);

    function formatPhoneNumber(phone:any) {
        return phone?.replace(/\D/g, '');
    }

    const onSubmit = ({ phone }: {phone: any}) => {
        mutate({ endpoint: '/api/app/auth/send-otp', attributes: { phoneNumber: `+998${formatPhoneNumber(phone)}` } }, {
            onSuccess: (res) => {
                if (isEqual(get(res,'data'), "OTP sent successfully")) {
                    router.push(`/auth/login/+998${formatPhoneNumber(phone)}/${get(res,'headers.authorization')}`);
                }
            },
            onError: (e) => {
                setErrorStatus(get(e,'status',null))
            }
        });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Formik
                    onSubmit={onSubmit}
                    initialValues={{ phone: "" }}
                    validationSchema={identifySchema}
                    style={styles.container}
                >
                    {({
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          values,
                          errors,
                          touched,
                      }) => {
                        const handlePhoneChange = (value:any) => {
                            handleChange("phone")(value);
                            setErrorStatus(null)
                            if (value.length === 12) {
                                handleSubmit();
                            }
                        };
                        return (
                            <View style={styles.container}>
                                <View style={styles.headerContainer}>
                                    <Image
                                        source={require('@/assets/images/logo.png')}
                                        style={styles.icon}
                                    />
                                    <Text
                                        style={{
                                            marginTop: 40,
                                            marginBottom: 70,
                                            fontWeight: 700,
                                            fontSize: 24
                                        }}
                                    >
                                        {t("Farma Life kiring")}
                                    </Text>
                                    <View style={{display: "flex",flexDirection: 'row'}}>
                                        <View style={{
                                            backgroundColor: "rgba(243, 243, 243, 1)",
                                            paddingVertical: 8,
                                            paddingLeft: 12,
                                            paddingRight: 20,
                                            borderRadius: 14,
                                            marginRight: 14,
                                            width: "30%"
                                        }}>
                                            <Text style={{color: "#818181", fontWeight: 400, fontSize: 12}}>{t("Kod")}</Text>
                                            <View style={{display: 'flex', flexDirection: "row"}}>
                                                <Text style={{fontSize: 18,fontWeight: 600}}>+998</Text>
                                                <Image
                                                    source={require('@/assets/images/uz.png')}
                                                    style={{width: 24,height: 24,marginLeft: 12}}
                                                />
                                            </View>
                                        </View>
                                        <View style={{width: "65%"}}>
                                            <MaskInput
                                                style={[
                                                    styles.input,
                                                    !errors.phone && !touched.phone && styles.inputDefault,
                                                    errors.phone && touched.phone && styles.inputError,
                                                    touched.phone && !errors.phone && styles.inputFocused
                                                ]}
                                                keyboardType="phone-pad"
                                                maxLength={12}
                                                height={56}
                                                onBlur={handleBlur("phone")}
                                                value={values.phone}
                                                onChangeText={handlePhoneChange}
                                                mask={[/\d/, /\d/, ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                                            />
                                        </View>
                                    </View>
                                    {errors.phone && touched.phone && (
                                        <Text style={styles.errorText}>
                                            {t(errors.phone)}
                                        </Text>
                                    )}
                                    {!isNull(errorStatus) && (
                                        <Text style={styles.errorText}>
                                            {t("Raqam topilmadi")}
                                        </Text>
                                    )}
                                </View>
                                <Button onPress={handleSubmit} style={styles.submitButton} isLoading={isPending}>
                                    <Text style={styles.submitButtonText}>{t("Davom eting")}</Text>
                                </Button>
                            </View>
                        );
                    }}
                </Formik>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "white",
        width: "100%",
        padding: 20,
    },
    headerContainer: {
        marginTop: 112,
        marginBottom: 40,
        width: "100%",
        alignItems: "center",
    },
    icon: {
        width: 120,
        height: 96,
    },
    input: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        fontSize: 16,
        backgroundColor: "rgba(243, 243, 243, 1)",
    },
    inputDefault: {
        borderColor: "#ccc",
    },
    inputError: {
        borderColor: "red",
    },
    inputFocused: {
        borderColor: "blue",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 10,
    },
    submitButton: {
        width: "100%",
        paddingVertical: 16,
        backgroundColor: "#0C5591",
        borderRadius: 14,
        height: 56,
        alignItems: "center",
    },
    submitButtonText: {
        fontSize: 18,
        color: "white",
    },
});

export default Index;
