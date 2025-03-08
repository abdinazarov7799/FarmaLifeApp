import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import CloseIcon from "@/assets/icons/close.svg"
import {useTranslation} from "react-i18next";
import {request} from "@/lib/api";
import {Button} from "native-base";
import Loader from "@/components/shared/Loader";
import {useNetworkStore} from "@/store";

export default function CameraScreen({setPhotoUrl, onClose, handleNavigate,offlineSupport = false}) {
    const { isOnline } = useNetworkStore();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraReady, setCameraReady] = useState(false);
    const cameraRef = useRef(null);
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);

    if (!permission) {
        return <View />;
    }

    if (loading) return <Loader />

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={{margin: "auto"}}>
                    <Text style={{marginBottom: 10}}>{t("Kameradan foydalanish uchun ruxsat so‘raymiz.")}</Text>
                    <Button onPress={requestPermission} style={{backgroundColor: "#0C5591"}}>
                        <Text style={{color: "#fff"}}>{t("Ruxsat berish")}</Text>
                    </Button>
                </View>
            </View>
        );
    }

    const compressImage = async (uri: string): Promise<string> => {
        try {
            const compressedImage = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 800 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            return compressedImage.uri;
        } catch (error) {
            console.error("Rasmni siqishda xatolik:", error);
            return uri;
        }
    };

    const takePicture = async () => {
        if (!cameraReady) {
            Alert.alert("Xatolik", "Kamera hali tayyor emas!");
            return;
        }

        if (!cameraRef.current) {
            Alert.alert("Xatolik", "Kamera ishga tushmagan yoki noto‘g‘ri ishlamoqda.");
            return;
        }

        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current?.takePictureAsync({ base64: false, skipProcessing: true });
                const compressedUri = await compressImage(photo.uri);

                if (offlineSupport) {
                    if (isOnline) {
                        const formData = new FormData();
                        formData.append("file", {
                            uri: compressedUri,
                            name: "photo.jpg",
                            type: "image/jpeg",
                        } as any);
                        const response = await request.post("api/files/upload", formData, {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        });
                        if (response.data) {
                            setPhotoUrl(response.data);
                        } else {
                            Alert.alert("Xatolik", "Rasm yuklanmadi");
                        }
                    } else {
                        handleNavigate(compressedUri);
                    }
                }else {
                    const formData = new FormData();
                    formData.append("file", {
                        uri: compressedUri,
                        name: "photo.jpg",
                        type: "image/jpeg",
                    } as any);

                    const response = await request.post("api/files/upload", formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                    if (response.data) {
                        setPhotoUrl(response.data);
                    } else {
                        Alert.alert("Xatolik", "Rasm yuklanmadi");
                    }
                }

            } catch (error) {
                console.log(error,'error')
                Alert.alert("Xatolik", "Rasm olishda muammo yuz berdi.");
            }
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {t("Camera")}
                </Text>
                <TouchableOpacity onPress={onClose}>
                    <CloseIcon  />
                </TouchableOpacity>
            </View>

            <CameraView
                mute={true}
                autofocus={'on'}
                onCameraReady={() => setCameraReady(true)}
                pictureSize={'800'}
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
            />

            <View style={styles.controls}>
                <Button style={styles.captureButton} onPress={takePicture} isLoading={loading}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: 9999
    },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10,
        width: "100%",
        height: 44,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 18,
        fontWeight: "500",
    },
    camera: {
        flex: 1,
    },
    controls: {
        position: "absolute",
        bottom: 40,
        left: "50%",
        transform: [{ translateX: -35 }],
    },
    captureButton: {
        width: 70,
        height: 70,
        backgroundColor: "white",
        borderRadius: 35,
        borderWidth: 5,
        borderColor: "rgba(255,255,255,0.6)",
    },
});
