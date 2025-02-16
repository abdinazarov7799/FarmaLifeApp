import {Redirect, Tabs} from "expo-router";
import React, {useEffect} from "react";
import {TabBarIcon} from "@/components/navigation/TabBarIcon";
import {useTranslation} from "react-i18next";
import {useAuthStore} from "@/store";
import {Filter} from "@/components/navigation/filter";
import useFetchRequest from "@/hooks/api/useFetchRequest";
import {Image} from "react-native";

export default function TabLayout() {
	const {t} = useTranslation();
	const user = useAuthStore(state => (state as any).user);
	const setUser = useAuthStore(state => (state as any).setUser);
	const {data} = useFetchRequest({
		queryKey: '/api/app/user-profile/get-me',
		endpoint: '/api/app/user-profile/get-me',
	})

	useEffect(() => {
		setUser(data)
	},[data])

	if (user === null) return <Redirect href={"/auth"} />;

	return (
		<Tabs
			screenOptions={{
				headerStyle: {
					backgroundColor: "#fff",
					borderBottomLeftRadius: 12,
					borderBottomRightRadius: 12,
				},
				tabBarActiveTintColor: "#215ca0",
				tabBarStyle: {
					paddingTop: 2,
					backgroundColor: "#fff",
					borderTopWidth: 1,
					borderTopColor: "#ddd",
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -3 },
					shadowOpacity: 0.1,
					shadowRadius: 6,
					elevation: 5,
					borderTopLeftRadius: 12,
					borderTopRightRadius: 12,
				},
				headerTintColor: "#000",
				headerTitleStyle: { fontFamily: 'Inter', fontWeight: 500, fontSize: 18 },
				tabBarLabelStyle: { fontSize: 12, fontFamily: 'Inter' },
			}}
		>
			<Tabs.Screen
				name="index"
				key="index"
				options={{
					title: t("Bosh sahifa"),
					headerTitleAlign: "center",
					headerRight: Filter,
					tabBarIcon: ({color}) => (
						<Image source={require('@/assets/icons/home-icon.png')} style={{tintColor: color}} width={24} height={24} />
					),
					tabBarLabel: t("Bosh sahifa"),
				}}
			/>
			<Tabs.Screen
				name="pharmacies"
				key="pharmacies"
				options={{
					title: t("Dorixonalar"),
					headerTitleAlign: "center",
					headerRight: Filter,
					tabBarIcon: ({color}) => (
						<Image source={require('@/assets/icons/pills-icon.png')} style={{tintColor: color}} width={24} height={24} />
					),
					tabBarLabel: t("Dorixonalar"),
				}}
			/>
			<Tabs.Screen
				name="med"
				key="med"
				options={{
					title: t("Tibbiyot"),
					headerTitleAlign: "center",
					headerRight: Filter,
					tabBarIcon: ({color}) => (
						<Image source={require('@/assets/icons/medicine-icon.png')} style={{tintColor: color}} width={24} height={24} />
					),
					tabBarLabel: t("Tibbiyot"),
				}}
			/>
			<Tabs.Screen
				name="history"
				key="history"
				options={{
					title: t("Tarix"),
					headerTitleAlign: "center",
					headerRight: Filter,
					tabBarIcon: ({color}) => (
						<Image source={require('@/assets/icons/history-icon.png')} style={{tintColor: color}} width={24} height={24} />
					),
					tabBarLabel: t("Tarix"),
				}}
			/>
			<Tabs.Screen
				name="profile"
				key="profile"
				options={{
					title: t("Profil"),
					headerTitleAlign: "center",
					headerRight: Filter,
					tabBarIcon: ({color}) => (
						<Image source={require('@/assets/icons/profile-icon.png')} style={{tintColor: color}} width={24} height={24} />
					),
					tabBarLabel: t("Profil"),
				}}
			/>
		</Tabs>
	);
}
