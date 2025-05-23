import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { TextInput, Button, useTheme, Text } from "react-native-paper";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useDeleteEventMutation, useUpdateEventMutation } from "@/store/app";
import { EventResponse } from "@/types";
import { useAppDispatch } from "@/hooks/redux-hooks";
import { setReload } from "@/store/app/appSlice";

export default function EventDetailScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const navigation = useNavigation();
  const { event } = useLocalSearchParams();
  const [showPicker, setShowPicker] = useState(false);
  const dispatch = useAppDispatch();

  const [deleteEvent] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();

  const eventData: EventResponse = useMemo(
    () => JSON.parse(event as string),
    [event]
  );

  useEffect(() => {
    if (eventData) {
      setTitle(eventData.title);
      setDate(new Date(eventData.eventTime));
    }
  }, [eventData]);

  const saveEvent = async () => {
    try {
      await updateEvent({
        payload: { title, eventTime: date.toISOString() },
        eventId: eventData.id,
      }).unwrap();
      navigation.goBack();
      dispatch(setReload());
    } catch (error) {
      console.error("Failed to save event", error);
    }
  };

  const showPickerHandler = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date,
        onChange,
        mode: "date",
        display: "spinner",
        positiveButton: {
          label: "OK",
          textColor: colors.primary,
        },
        negativeButton: {
          label: "Cancel",
          textColor: colors.error,
        },
      });
    } else {
      setShowPicker(true);
    }
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const deleteEventhandler = async () => {
    try {
      await deleteEvent(eventData.id).unwrap();
      navigation.goBack();
      dispatch(setReload());
    } catch (error) {}
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    input: {
      marginBottom: 20,
      backgroundColor: colors.surface,
    },
    buttonContainer: {
      marginTop: 20,
    },
    button: {
      marginVertical: 10,
    },
    dateButton: {
      borderWidth: 1,
      borderRadius: 4,
      padding: 16,
      marginBottom: 16,
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.outline,
    },
    dateText: {
      color: colors.onSurface,
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        label="Event Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        textColor={colors.onSurface}
        underlineColor={colors.onSurfaceVariant}
        activeUnderlineColor={colors.primary}
      />

      <TouchableOpacity onPress={showPickerHandler} style={styles.dateButton}>
        <Text style={styles.dateText} variant="bodyMedium">
          {date.toLocaleString()}
        </Text>
      </TouchableOpacity>

      {showPicker && Platform.OS === "ios" && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="spinner"
          onChange={onChange}
          accentColor={colors.primary}
          themeVariant={theme.dark ? "dark" : "light"}
          minuteInterval={5}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={saveEvent}
          style={styles.button}
          buttonColor={colors.primary}
          textColor={colors.onPrimary}
        >
          Update
        </Button>

        {eventData && (
          <Button
            mode="outlined"
            onPress={deleteEventhandler}
            style={[styles.button, { borderColor: colors.error }]}
            textColor={colors.error}
          >
            Delete
          </Button>
        )}
      </View>
    </View>
  );
}
