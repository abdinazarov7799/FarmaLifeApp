import {useRouter} from "expo-router";
import {Image} from "react-native";
import React from "react";

export const Filter = () => {
	const router = useRouter();
	const handleNavigate = () => {
		router.push("/");
	};
	return (
		<Image
			source={require('@/assets/icons/filter-icon.png')}
			style={{width: 20,height: 20,marginRight: 16}}
		/>
	);
};
