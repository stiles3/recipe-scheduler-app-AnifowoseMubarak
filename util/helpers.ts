import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { v4 as uuidv4 } from "uuid";
import * as Application from "expo-application";

export async function getBestDeviceIdentifier() {
  let deviceId;

  if (Platform.OS === "android") {
    deviceId = Application.getAndroidId();
  } else if (Platform.OS === "ios") {
    deviceId = await Application.getIosIdForVendorAsync();
  }
  //fallback uuid
  if (!deviceId || deviceId === "unknown") {
    const storedId = await SecureStore.getItemAsync("fallback_device_id");
    if (storedId) {
      deviceId = storedId;
    } else {
      deviceId = uuidv4();
      await SecureStore.setItemAsync("fallback_device_id", deviceId);
    }
  }

  return deviceId;
}
