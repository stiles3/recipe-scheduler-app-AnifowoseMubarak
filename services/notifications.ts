// services/notificationService.ts
import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { showToast } from "@/util/notify";

export async function registerForPushNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    throw new Error("Must use physical device for push notifications");
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error("Permission not granted for notifications");
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error("Project ID not found");
  }

  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

export function setupNotificationHandlers(navigationRef: any) {
  // Foreground notifications
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      showToast(notification.request.content.body || "New notification");
    }
  );

  // Notification taps
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.url) {
        Linking.openURL(data.url);
      } else if (data?.screen) {
        navigationRef.current?.navigate(data.screen, data.params);
      }
    });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
