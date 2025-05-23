import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ThemeProvider, useThemeContext } from "@/theme/ThemeContext";
import { PaperProvider } from "react-native-paper";
import Header from "@/components/Header";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

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

const PaperProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useThemeContext();

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <ThemeProvider>
        <PaperProviderWrapper>
          <Stack
            screenOptions={({ navigation }) => ({
              header: ({ route }) => (
                <Header
                  title={route.name}
                  showBackButton={navigation.canGoBack()}
                />
              ),
            })}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="event-details" />
          </Stack>
        </PaperProviderWrapper>
      </ThemeProvider>
    </Provider>
  );
}
