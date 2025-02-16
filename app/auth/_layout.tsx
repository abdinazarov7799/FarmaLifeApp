import React from 'react';
import {Redirect, Slot} from 'expo-router';
import {useAuthStore} from "@/store";
import { SafeAreaView } from 'react-native-safe-area-context';
import {get} from "lodash";

const AuthLayout = () => {
    const user = useAuthStore(state => get(state,'user'))
    if (user !== null) return <Redirect href={"/"}/>;
    return (<>
            <SafeAreaView style={{flex: 1}}>
                <Slot/>
            </SafeAreaView>
        </>
    );
};

export default AuthLayout;
