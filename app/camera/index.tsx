import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CloseIcon from "@/assets/icons/close.svg"
import {useTranslation} from "react-i18next";
import {router} from "expo-router";

export default function CameraScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const {t} = useTranslation();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Kameradan foydalanish uchun ruxsat so‘raymiz.</Text>
                <Button onPress={requestPermission} title="Ruxsat berish" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            console.log("Rasm olingan:", photo.uri);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {t("Camera")}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <CloseIcon  />
                </TouchableOpacity>
            </View>

            <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

            <View style={styles.controls}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
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
        fontWeight: 500,
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
