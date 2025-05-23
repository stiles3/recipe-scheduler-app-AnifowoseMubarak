import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import Modal from "react-native-modal";
import { Button, TextInput, Text, useTheme } from "react-native-paper";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: { title: string; date: Date }) => void;
  existingEvent?: { title: string; date: Date };
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingEvent,
}) => {
  const [title, setTitle] = useState(existingEvent?.title || "");
  const [date, setDate] = useState(existingEvent?.date || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, date });
    onClose();
  };

  const quickTimeOptions = [
    { label: "30 mins", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "3 hours", value: 180 },
    { label: "Tomorrow", value: 1440 }, // 24 hours
  ];

  const showPickerHandler = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date,
        onChange,
        mode: "date",
        display: "spinner",
        positiveButton: {
          label: "OK",
          textColor: "green",
        },
        negativeButton: {
          label: "Cancel",
          textColor: "red",
        },
      });
    } else {
      setShowPicker(true);
    }
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal
      isVisible={isOpen}
      style={styles.modal}
      onBackdropPress={onClose}
      backdropTransitionOutTiming={0}
      avoidKeyboard={true} // This helps with keyboard avoidance
      propagateSwipe={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.header}>
            <Text variant="titleMedium">
              {existingEvent ? "Edit Event" : "Add New Event"}
            </Text>
          </View>

          <TextInput
            label="Event Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
            autoFocus
          />

          <TouchableOpacity
            onPress={showPickerHandler}
            style={[styles.dateButton, { borderColor: theme.colors.outline }]}
          >
            <Text variant="bodyMedium">{date.toLocaleString()}</Text>
          </TouchableOpacity>

          {showPicker && Platform.OS === "ios" && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="spinner"
              onChange={onChange}
              accentColor="blue"
              themeVariant="light"
              minuteInterval={5}
            />
          )}

          <View style={styles.quickTimeContainer}>
            {quickTimeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  const newDate = new Date();
                  newDate.setMinutes(newDate.getMinutes() + option.value);
                  setDate(newDate);
                }}
                style={[
                  styles.quickTimeButton,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text variant="labelMedium">{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={!title.trim()}
          >
            {existingEvent ? "Update Event" : "Add Event"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  quickTimeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  quickTimeButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  submitButton: {
    marginTop: 8,
  },
});
