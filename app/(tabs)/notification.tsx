import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useTheme, Text } from "react-native-paper";
import * as Notifications from "expo-notifications";

export default function Notification() {
  const theme = useTheme();
  const { colors } = theme;

  const [notifications, setNotifications] = useState<
    Notifications.Notification[]
  >([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const delivered = await Notifications.getPresentedNotificationsAsync();
      setNotifications(delivered);
    };

    fetchNotifications();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    notification: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
      backgroundColor: colors.surface,
    },
    notificationTitle: {
      fontWeight: "bold",
      color: colors.onSurface,
    },
    notificationBody: {
      color: colors.onSurfaceVariant,
    },
    emptyText: {
      color: colors.onSurfaceVariant,
      textAlign: "center",
      marginTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.request.identifier}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <Text style={styles.notificationTitle}>
              {item.request.content.title}
            </Text>
            <Text style={styles.notificationBody}>
              {item.request.content.body}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications</Text>
        }
      />
    </View>
  );
}
