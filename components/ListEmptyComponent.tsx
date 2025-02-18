import React from 'react';
import {View,Text} from "react-native";
import {useTranslation} from "react-i18next";

const ListEmptyComponent = ({text = null}:{text:any}) => {
    const {t} = useTranslation();
    return (
        <View style={{width: "100%",minHeight: 100, display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Text style={{fontWeight: 500}}>
                {t(text ?? "Malumot topilmadi")}
            </Text>
        </View>
    );
};

export default ListEmptyComponent;
