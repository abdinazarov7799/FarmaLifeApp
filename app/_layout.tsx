import {useFonts, Inter_400Regular} from "@expo-google-fonts/inter";
import {Stack} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useEffect} from "react";
import "react-native-reanimated";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {extendTheme, NativeBaseProvider} from "native-base";
import "../lib/i18n";
import {useTranslation} from "react-i18next";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {StatusBar} from "expo-status-bar";
import {useAuthStore, useNetworkStore} from "@/store";
import AppUpdateChecker from "@/components/AppUpdateChecker";
import React from "react";
import * as Network from "expo-network";
import { Text } from "react-native";
import {OfflineManager} from "@/lib/offlineManager";
import {PersistQueryClientProvider} from "@tanstack/react-query-persist-client";
import {MMKV} from "react-native-mmkv";
import isToday from "dayjs/plugin/isToday";
import dayjs from "dayjs";
SplashScreen.preventAutoHideAsync();

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { fontFamily: "Inter" };

const theme = extendTheme({
	fonts: {
		heading: "Inter",
		body: "Inter",
		mono: "Inter",
	},
});

export default function RootLayout() {
	const [loaded] = useFonts({
		Inter: Inter_400Regular,
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

const storage = new MMKV();

const mmkvPersister = {
	persistClient: (client) => {
		storage.set("react-query-cache", JSON.stringify(client));
	},
	restoreClient: () => {
		const cache = storage.getString("react-query-cache");
		return cache ? JSON.parse(cache) : undefined;
	},
	removeClient: () => {
		storage.delete("react-query-cache");
	},
};



function RootLayoutNav() {
	dayjs.extend(isToday)
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5,
				gcTime: 1000 * 60 * 60 * 24,
				refetchOnWindowFocus: false,
				refetchOnReconnect: true,
				retry: 1,
			},
		},
	});

	const {i18n} = useTranslation();
	const {lang,user} = useAuthStore()
	const { setIsOnline, isOnline } = useNetworkStore();

	useEffect(() => {
		const checkNetworkStatus = async () => {
			const networkState = await Network.getNetworkStateAsync();
			setIsOnline(networkState.isConnected);
		};
		checkNetworkStatus();

		const unsubscribe = Network.addNetworkStateListener((networkState) => {
			setIsOnline(networkState.isConnected);
		});

		return () => {
			unsubscribe.remove();
		};
	}, []);


	useEffect(() => {
		const syncOfflineData = async () => {
			await OfflineManager(isOnline);
		};

		if (isOnline) {
			syncOfflineData();
		}
	}, [isOnline]);



	const loadLanguage = async () => {
		try {
			if (lang) {
				i18n.changeLanguage(lang);
			}
		} catch (e) {
			console.log(e);
		}
	};
	useEffect(() => {
		loadLanguage();
	}, []);

	return (
		<>
			<PersistQueryClientProvider client={queryClient} persistOptions={{ persister: mmkvPersister }}>
				<QueryClientProvider client={queryClient}>
					<GestureHandlerRootView>
						<NativeBaseProvider theme={theme}>
							<AppUpdateChecker />
							<StatusBar style={"dark"} />
							<BottomSheetModalProvider>
								<Stack initialRouteName={!user ? 'auth' : '(tabs)'}>
									<Stack.Screen name="(tabs)" options={{headerShown: false}} />
									<Stack.Screen name="+not-found" />
									<Stack.Screen name="auth" options={{headerShown: false,}} />
									<Stack.Screen name="filter" options={{headerShown: false,}} />
									<Stack.Screen name="history/pharmacy/[id]" options={{headerShown: false,}} />
									<Stack.Screen name="history/med/[id]" options={{headerShown: false,}} />
									<Stack.Screen name="med/[id]" options={{headerShown: false,}} />
									<Stack.Screen name="pharmacy/[id]" options={{headerShown: false,}} />
									<Stack.Screen name="pharmacy/add" options={{headerShown: false,}} />
									<Stack.Screen name="pharmacy/stocks" options={{headerShown: false,}} />
									<Stack.Screen name="med/add/doctor" options={{headerShown: false,}} />
									<Stack.Screen name="med/add/pharmacy" options={{headerShown: false,}} />
								</Stack>
							</BottomSheetModalProvider>
						</NativeBaseProvider>
					</GestureHandlerRootView>
				</QueryClientProvider>
			</PersistQueryClientProvider>
		</>
	);
}
