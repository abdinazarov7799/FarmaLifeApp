import React from "react";
import {SafeAreaView} from "react-native";
import {Slot} from "expo-router";

const CameraLayout = () => {
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#fff"}}>
            <Slot />
        </SafeAreaView>
    );
};

export default CameraLayout;
