import React from "react";
import {SafeAreaView} from "react-native";
import {Slot} from "expo-router";

const Layout = () => {
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#fff"}}>
            <Slot />
        </SafeAreaView>
    );
};

export default Layout;
