import {Redirect, Tabs} from "expo-router";
import React, {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {useAuthStore} from "@/store";
import useFetchRequest from "@/hooks/api/useFetchRequest";
import HomeIcon from "@/assets/icons/home-icon.svg"
import PillsIcon from "@/assets/icons/pills-icon.svg"
import MedIcon from "@/assets/icons/medicine-icon.svg"
import HistoryIcon from "@/assets/icons/history-icon.svg"
import ProfileIcon from "@/assets/icons/profile-icon.svg"

export default function TabLayout() {
	const {t} = useTranslation();
	const user = useAuthStore(state => (state as any).user);
	const accessToken = useAuthStore(state => (state as any).accessToken);
	const setUser = useAuthStore(state => (state as any).setUser);
	const {data} = useFetchRequest({
		queryKey: '/api/app/user-profile/get-me',
		endpoint: '/api/app/user-profile/get-me',
		enabled: !!accessToken
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
					tabBarIcon: ({color}) => (
						<HomeIcon width={24} height={24} style={{ color }} />
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
					tabBarIcon: ({color}) => (
						<PillsIcon width={24} height={24} style={{ color }} />
					),
					tabBarLabel: t("Dorixonalar"),
				}}
			/>
			<Tabs.Screen
				name="med"
				key="med"
				options={{
					title: t("Tibbiyot muassasalari"),
					headerTitleAlign: "center",
					tabBarIcon: ({color}) => (
						<MedIcon width={24} height={24} style={{ color }} />
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
					tabBarIcon: ({color}) => (
						<HistoryIcon width={24} height={24} style={{ color }} />
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
					tabBarIcon: ({color}) => (
						<ProfileIcon width={24} height={24} style={{ color }} />
					),
					tabBarLabel: t("Profil"),
				}}
			/>
		</Tabs>
	);
}
