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
import {useAuthStore} from "@/store";
import AppUpdateChecker from "@/components/AppUpdateChecker";
import React from "react";
import * as Network from "expo-network";
import { Text } from "react-native";
import {PersistQueryClientProvider} from "@tanstack/react-query-persist-client";
import isToday from "dayjs/plugin/isToday";
import dayjs from "dayjs";
import { onlineManager } from '@tanstack/react-query'
import {createSyncStoragePersister} from "@tanstack/query-sync-storage-persister";
import {storageAdapter} from "@/lib/storage";
import {get, isString} from "lodash";

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

onlineManager.setEventListener((setOnline) => {
	const eventSubscription = Network.addNetworkStateListener((state) => {
		setOnline(!!state.isConnected)
	})
	return eventSubscription.remove
})

const persister = createSyncStoragePersister({ storage: storageAdapter });

const queryClient = new QueryClient();

const queryClientOffline = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
			gcTime: 1000 * 60 * 60 * 48,
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			retry: 0,
		},
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



function RootLayoutNav() {
	dayjs.extend(isToday)

	const {i18n} = useTranslation();
	const {lang} = useAuthStore()
	const store = storageAdapter.getItem('auth-store')
	const parsedStore = isString(store) ? JSON.parse(store) : store
	const user = get(parsedStore,'state.user')

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
			{/*<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>*/}
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
									<Stack.Screen name="history/pharmacy/[id]" options={{headerShown: false,}} />
									<Stack.Screen name="history/med/[id]" options={{headerShown: false,}} />
									<Stack.Screen name="med/[id]" options={{headerShown: false,}} />
									<Stack.Screen name="pharmacy/[id]" options={{headerShown: false,}} />
									<Stack.Screen name="pharmacy/add" options={{headerShown: false,}} />
									<Stack.Screen name="pharmacy/edit" options={{headerShown: false,}} />
									<Stack.Screen name="pharmacy/stocks" options={{headerShown: false,}} />
									<Stack.Screen name="med/add/doctor" options={{headerShown: false,}} />
									<Stack.Screen name="med/add/pharmacy" options={{headerShown: false,}} />
									<Stack.Screen name="med/edit/doctor" options={{headerShown: false,}} />
									<Stack.Screen name="med/edit/pharmacy" options={{headerShown: false,}} />
								</Stack>
							</BottomSheetModalProvider>
						</NativeBaseProvider>
					</GestureHandlerRootView>
				</QueryClientProvider>
			{/*</PersistQueryClientProvider>*/}
		</>
	);
}
