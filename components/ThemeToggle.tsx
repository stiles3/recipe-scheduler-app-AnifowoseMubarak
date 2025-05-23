import { useThemeContext } from "@/theme/ThemeContext";
import React from "react";
import { Switch, useTheme, IconButton } from "react-native-paper";
import { View, StyleSheet } from "react-native";

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useThemeContext();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <IconButton
        icon={isDark ? "weather-night" : "white-balance-sunny"}
        iconColor={theme.colors.primary}
        size={24}
        onPress={toggleTheme}
        testID="theme-icon"
      />
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        color={theme.colors.primary}
        testID="theme-switch"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8, // Adjust this value as needed
  },
});

export default ThemeToggle;
