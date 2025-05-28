import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useNavigationContainerRef } from "expo-router";
import { View, Text, Linking } from "react-native";
import { useTheme } from "react-native-paper";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { useSetUserTokenMutation } from "@/store/app";
import { getBestDeviceIdentifier } from "@/util/helpers";
import { setDeviceId } from "@/store/app/appSlice";
import { useAppDispatch } from "@/hooks/redux-hooks";
import Header from "@/components/Header";
import { showToast } from "@/util/notify";
import {
  registerForPushNotifications,
  setupNotificationHandlers,
} from "@/services/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    console.log(Constants.expoConfig);
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const theme = useTheme();

  const dispatch = useAppDispatch();

  const [expoPushToken, setExpoPushToken] = useState("");
  const [setUserToken] = useSetUserTokenMutation();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications()
      .then((token) => {
        // Store/send this token to your server
        console.log("Push token:", token);
      })
      .catch((error) => {
        console.warn("Notification registration error:", error);
      });

    // Setup notification handlers
    const cleanupHandlers = setupNotificationHandlers(navigationRef);

    // Notification count handler
    const countSubscription = Notifications.addNotificationReceivedListener(
      () => {
        setNotificationCount((prev) => prev + 1);
      }
    );

    return () => {
      cleanupHandlers();
      countSubscription.remove();
    };
  }, [navigationRef]);

  const setUserTokenHandler = async () => {
    let userId = await getBestDeviceIdentifier();
    dispatch(setDeviceId(userId));
    try {
      await setUserToken({
        userId: userId,
        token: expoPushToken,
      }).unwrap();
      console.log("success")
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    if (expoPushToken) {
      setUserTokenHandler();
    }
  }, [expoPushToken]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        setNotificationCount(0);
      }
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
        setNotificationCount((prev) => prev + 1);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
          },
          header: ({ route, navigation }) => (
            <Header
              title={route.name}
              showBackButton={navigation.canGoBack()}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Events",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="calendar" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            title: "Notifications",
            tabBarIcon: ({ color }) => (
              <View style={{ position: "relative" }}>
                <TabBarIcon name="bell" color={color} />
                {notificationCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      right: -6,
                      top: -3,
                      backgroundColor: theme.colors.error,
                      borderRadius: 6,
                      width: 12,
                      height: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.onError,
                        fontSize: 8,
                        fontWeight: "bold",
                      }}
                    >
                      {notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
