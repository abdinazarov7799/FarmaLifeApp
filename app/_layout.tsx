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
import { Text } from "react-native";

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

function RootLayoutNav() {
	const queryClient = new QueryClient();
	const {i18n} = useTranslation();
	const {lang,user} = useAuthStore()

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
							</Stack>
						</BottomSheetModalProvider>
					</NativeBaseProvider>
				</GestureHandlerRootView>
			</QueryClientProvider>
		</>
	);
}
