import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { List, IconButton, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { AddEventModal } from "@/components/modal/AddEventModal";
import {
  useAddEventMutation,
  useDeleteEventMutation,
  useGetUpcomingEventsQuery,
} from "@/store/app";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { EventResponse } from "@/types";
import { setReload } from "@/store/app/appSlice";

export default function Home() {
  const theme = useTheme();
  const { colors } = theme;
  const [events, setEvents] = useState<EventResponse[]>([]);
  const deviceId = useAppSelector((state) => state.app.deviceId);
  const dispatch = useAppDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addEvent] = useAddEventMutation();
  const {
    data,
    isLoading: eventLoading,
    refetch,
  } = useGetUpcomingEventsQuery(deviceId);
  const [deleteEvent] = useDeleteEventMutation();
  const reload = useAppSelector((state) => state.app.reload);

  useEffect(() => {
    if (data) {
      setEvents(data);
    }
  }, [data]);

  useEffect(() => {
    if (reload) {
      refetch();
      dispatch(setReload());
    }
  }, [reload]);

  const deleteEventhandler = async (id: string) => {
    try {
      await deleteEvent(id).unwrap();
    } catch (error) {}
  };

  const renderRightActions = (id: string) => (
    <View style={[styles.deleteContainer, { backgroundColor: colors.surface }]}>
      <IconButton
        icon="delete"
        size={24}
        iconColor={colors.error}
        onPress={() => deleteEventhandler(id)}
      />
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    deleteContainer: {
      justifyContent: "center",
      alignItems: "center",
      width: 70,
    },
    addButton: {
      position: "absolute",
      right: 20,
      bottom: 20,
      backgroundColor: colors.primary,
    },
    listItem: {
      backgroundColor: colors.surface,
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/event-details",
                  params: {
                    event: JSON.stringify(item),
                  },
                });
              }}
            >
              <List.Item
                title={item.title}
                description={item.eventTime.toLocaleString()}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="calendar"
                    color={colors.primary}
                  />
                )}
                style={styles.listItem}
                titleStyle={{ color: colors.onSurface }}
                descriptionStyle={{ color: colors.onSurfaceVariant }}
              />
            </TouchableOpacity>
          </Swipeable>
        )}
      />
      <IconButton
        icon="plus"
        iconColor={colors.onPrimary}
        size={30}
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      />
      <AddEventModal
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={async (newEvent) => {
          try {
            const response = await addEvent({
              userId: deviceId,
              title: newEvent.title,
              eventTime: newEvent.date.toISOString(),
            }).unwrap();
            setEvents((prev) => [...prev, response]);
          } catch (error) {}
        }}
      />
    </View>
  );
}
