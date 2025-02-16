import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from "expo-router";
import usePostQuery from "@/hooks/api/usePostQuery";
import { useTranslation } from "react-i18next";
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StyleSheet,
    Image
} from "react-native";
import { Button } from "native-base";
import ReactNativeOtpTextinput from "react-native-otp-textinput/index";
import {useAuthStore} from "@/store";
import {get} from "lodash";

const Login = () => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState("");
    const [isError, setIsError] = useState(false);
    const { rest } = useLocalSearchParams();
    const router = useRouter();
    const [timerCount, setTimer] = useState(60);
    const [chargeTimer, setChargeTimer] = useState(false);
    const { mutate, isPending } = usePostQuery({});
    const { mutate: sendOtp } = usePostQuery({});
    const setAccessToken = useAuthStore(state => state.setAccessToken);
    const setRefreshToken = useAuthStore(state => state.setRefreshToken);
    const setUser = useAuthStore(state => state.setUser);
    const phone = get(rest,'[0]')
    const token = get(rest,'[1]')

    useEffect(() => {
        let interval = setInterval(() => {
            setTimer(lastTimerCount => {
                if (lastTimerCount === 0) {
                    return 0;
                } else {
                    lastTimerCount <= 1 && clearInterval(interval);
                    return lastTimerCount - 1;
                }
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [chargeTimer]);

    useEffect(() => {
        if (otp && String(otp).length === 4) {
            setIsError(false);
            mutate({
                endpoint: '/api/app/auth/verify-otp',
                attributes: { phoneNumber: phone, otp },
                config: {
                    headers: {
                        Authorization: token
                    }
                }
            }, {
                onSuccess: (data) => {
                    const {accessToken,refreshToken,tokenType,...user} = get(data,'data');
                    setUser(user);
                    setRefreshToken(refreshToken);
                    setAccessToken(accessToken);
                    router.push(`/`);
                },
                onError: (e) => {
                    setIsError(true);
                    console.log(e);
                }
            });
        }
    }, [otp]);

    const reSendOtp = () => {
        setTimer(60);
        setChargeTimer(true);
        sendOtp({ endpoint: '/api/app/auth/send-otp', attributes: { phoneNumber: phone } }, {
            onSuccess: () => {},
            onError: () => {}
        });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={{width: 120, height: 96}}
                        />
                        <Text
                            style={{
                                marginTop: 40,
                                marginBottom: 40,
                                fontWeight: 700,
                                fontSize: 24
                            }}
                        >
                            {t("Farma Life kiring")}
                        </Text>

                        <ReactNativeOtpTextinput
                            inputCount={4}
                            autoFocus={true}
                            handleTextChange={(otp) => setOtp(otp)}
                            tintColor={"#246BB2"}
                        />

                        {isError && (
                            <Text style={styles.errorText}>
                                {t("Noto‘g‘ri kod kiritdingiz, qaytadan urunib ko‘ring")}
                            </Text>
                        )}
                        <Button
                            variant={"unstyled"}
                            style={styles.resendButton}
                            onPress={() => router.push('/auth')}
                        >
                            <Text style={{color: '#0C5591',marginTop: 40, marginBottom: 30, fontWeight: 500, fontSize: 16}}>
                                {t("Raqamni o’zgartirish")}
                            </Text>
                        </Button>
                        <Text style={{color: '#8E8E90', fontWeight: 500, fontSize: 16, textAlign: "center", width: 320}}>
                            {phone} {t("raqamiga tekshiruv kodini yubordik. 60 soniyadan keyin kodni qayta yuborishingiz mumkin.")}
                        </Text>
                    </View>

                    <View>
                        <Button
                            isDisabled={timerCount !== 0}
                            variant={"unstyled"}
                            style={styles.resendButton}
                            onPress={reSendOtp}
                        >
                            <Text style={styles.resendButtonText}>
                                {timerCount === 0 ? t("Kodni qayta yuborish") : t("Kodni qayta yuborish") + ": " + timerCount}
                            </Text>
                        </Button>
                        <Button
                            style={styles.confirmButton}
                            isDisabled={isPending || !otp}
                            onPress={() => setOtp(otp)}
                        >
                            <Text style={styles.confirmButtonText}>{t("Tasdiqlash")}</Text>
                        </Button>
                    </View>
                </View>
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
        justifyContent: "space-between",
        width: "100%",
        padding: 24,
    },
    headerContainer: {
        marginTop: 112,
        marginBottom: 20,
        width: "100%",
        maxWidth: 300,
        alignSelf: "center",
        alignItems: "center"
    },
    headerText: {
        fontSize: 28,
        fontFamily: "ALSSiriusBold",
        marginBottom: 16,
        marginTop: 24,
        textAlign: "center",
    },
    subHeaderText: {
        fontSize: 15,
        color: "gray",
        marginBottom: 24,
        textAlign: "center",
        fontFamily: "ALSSiriusRegular",
    },
    errorText: {
        color: "red",
        marginTop: 10,
        textAlign: "center",
        fontFamily: "ALSSiriusRegular",
    },
    resendButton: {
        marginBottom: 8,
    },
    resendButtonText: {
        fontFamily: "ALSSiriusRegular",
        color: "gray",
    },
    confirmButton: {
        backgroundColor: "#215ca0",
        paddingVertical: 16,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    confirmButtonText: {
        fontFamily: "ALSSiriusRegular",
        color: "white",
        fontSize: 18,
    },
});

export default Login;
