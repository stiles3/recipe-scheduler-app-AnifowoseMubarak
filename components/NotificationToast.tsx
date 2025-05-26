// components/NotificationToast.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const NotificationToast = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 40, // Shows below status bar
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
  },
});
