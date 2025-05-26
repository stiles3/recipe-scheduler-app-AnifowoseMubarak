import React, { createContext, useContext, useEffect, useState } from "react";
import { lightTheme, darkTheme, AppTheme } from "./index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import * as SystemUI from "expo-system-ui";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  theme: AppTheme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  themeMode: ThemeMode;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  setThemeMode: () => {},
  isDark: false,
  themeMode: "system",
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem("themeMode");
        if (
          savedPreference &&
          ["light", "dark", "system"].includes(savedPreference)
        ) {
          setThemeMode(savedPreference as ThemeMode);
          setIsDark(
            savedPreference === "system"
              ? systemColorScheme === "dark"
              : savedPreference === "dark"
          );
        }
      } catch (error) {
        console.error("Failed to load theme preference", error);
      }
    };

    loadThemePreference();
  }, []);

  useEffect(() => {
    const newIsDark =
      themeMode === "system"
        ? systemColorScheme === "dark"
        : themeMode === "dark";
    setIsDark(newIsDark);

    SystemUI.setBackgroundColorAsync(
      newIsDark ? darkTheme.colors.background : lightTheme.colors.background
    );
  }, [themeMode, systemColorScheme]);

  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem("themeMode", themeMode);
      } catch (error) {
        console.error("Failed to save theme preference", error);
      }
    };

    saveThemePreference();
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      if (prevMode === "light") return "dark";
      if (prevMode === "dark") return "system";
      return "light";
    });
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setThemeMode,
        isDark,
        themeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
