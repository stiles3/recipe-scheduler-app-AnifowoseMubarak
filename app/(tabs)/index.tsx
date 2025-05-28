import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import {
  List,
  IconButton,
  useTheme,
  SegmentedButtons,
  Menu,
} from "react-native-paper";
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
import moment from "moment";

type OptimisticUpdates = {
  adds: EventResponse[];
  deletes: string[];
};

type SortDirection = "asc" | "desc";

export default function Home() {
  const theme = useTheme();
  const { colors } = theme;
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdates>(
    {
      adds: [],
      deletes: [],
    }
  );
  const deviceId = useAppSelector((state) => state.app.deviceId);
  const dispatch = useAppDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addEvent] = useAddEventMutation();
  const [eventFilter, setEventFilter] = useState<"upcoming" | "all">(
    "upcoming"
  );
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<any>(null);
  const [limit, setLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const {
    data: serverEvents,
    isLoading: eventLoading,
    refetch,
    error: fetchError,
  } = useGetUpcomingEventsQuery({
    userId: deviceId,
    upcoming: eventFilter === "upcoming" ? "true" : "false",
    limit,
    lastEvaluatedKey,
  });

  const [deleteEvent] = useDeleteEventMutation();
  const reload = useAppSelector((state) => state.app.reload);

  useEffect(() => {
    if (serverEvents) {
    //  setLastEvaluatedKey(serverEvents?.lastEvaluatedKey);
      let filteredEvents = serverEvents.filter(
        (event) => !optimisticUpdates.deletes.includes(event.id)
      );
      filteredEvents = [...filteredEvents, ...optimisticUpdates.adds];

      filteredEvents.sort((a, b) => {
        const dateA = new Date(a.eventTime).getTime();
        const dateB = new Date(b.eventTime).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      });

      setEvents(filteredEvents);
      setIsLoadingMore(false);
    }
  }, [serverEvents, optimisticUpdates, sortDirection]);

  useEffect(() => {
    if (reload) {
      refetch();
      dispatch(setReload());
      setOptimisticUpdates({ adds: [], deletes: [] });
    }
  }, [reload, refetch, dispatch]);

  useEffect(() => {
    if (eventFilter) {
      // Reset pagination when filter changes
      setLastEvaluatedKey(null);
      setEvents([]);
      refetch();
    }
  }, [eventFilter]);

  useEffect(() => {
    if (fetchError) {
      Alert.alert("Error", "Failed to load events");
      setIsLoadingMore(false);
    }
  }, [fetchError]);

  const handleDeleteEvent = async (id: string) => {
    setOptimisticUpdates((prev) => ({
      ...prev,
      deletes: [...prev.deletes, id],
    }));

    try {
      await deleteEvent(id).unwrap();
      setOptimisticUpdates((prev) => ({
        ...prev,
        deletes: prev.deletes.filter((deletedId) => deletedId !== id),
      }));
    } catch (error) {
      setOptimisticUpdates((prev) => ({
        ...prev,
        deletes: prev.deletes.filter((deletedId) => deletedId !== id),
      }));
      Alert.alert("Error", "Failed to delete event");
    }
  };

  const handleAddEvent = async (newEvent: { title: string; date: Date }) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticEvent: EventResponse = {
      id: tempId,
      title: newEvent.title,
      eventTime: newEvent.date.toISOString(),
      createdAt: new Date().toISOString(),
      userId: deviceId,
      reminderMinutes: 0,
    };
    setOptimisticUpdates((prev) => ({
      ...prev,
      adds: [...prev.adds, optimisticEvent],
    }));

    try {
      const response = await addEvent({
        userId: deviceId,
        title: newEvent.title,
        eventTime: newEvent.date.toISOString(),
      }).unwrap();

      setOptimisticUpdates((prev) => ({
        adds: prev.adds.map((event) =>
          event.id === tempId ? { ...response, id: tempId } : event
        ),
        deletes: prev.deletes,
      }));

      dispatch(setReload());
    } catch (error) {
      setOptimisticUpdates((prev) => ({
        ...prev,
        adds: prev.adds.filter((event) => event.id !== tempId),
      }));
      Alert.alert("Error", "Failed to add event");
    }
  };

  const loadMoreEvents = () => {
    if (lastEvaluatedKey && !isLoadingMore) {
      setIsLoadingMore(true);
      setLimit((prevLimit) => prevLimit + 10);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const renderRightActions = (id: string) => (
    <View style={[styles.deleteContainer, { backgroundColor: colors.surface }]}>
      <IconButton
        icon="delete"
        size={24}
        iconColor={colors.error}
        onPress={() => handleDeleteEvent(id)}
      />
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator animating size="small" color={colors.primary} />
      </View>
    );
  };

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
      borderRadius: 30,
      elevation: 4,
    },
    listItem: {
      backgroundColor: colors.surface,
      paddingVertical: 12,
    },
    pendingItem: {
      opacity: 0.6,
    },
    errorText: {
      color: colors.error,
      textAlign: "center",
      margin: 16,
    },
    segmentedButtons: {
      margin: 16,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    footer: {
      paddingVertical: 20,
    },
  });

  const isPending = (id: string) => {
    return (
      optimisticUpdates.adds.some((e) => e.id === id) ||
      optimisticUpdates.deletes.includes(id)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <SegmentedButtons
          value={eventFilter}
          onValueChange={(value) => {
            setEventFilter(value as "upcoming" | "all");
            setLastEvaluatedKey(null);
            setEvents([]);
          }}
          buttons={[
            {
              value: "upcoming",
              label: "Upcoming",
            },
            {
              value: "all",
              label: "All",
            },
          ]}
          style={[styles.segmentedButtons, { flex: 1, marginRight: 8 }]}
        />

        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <IconButton
              icon={
                sortDirection === "asc"
                  ? "sort-calendar-ascending"
                  : "sort-calendar-descending"
              }
              onPress={() => setSortMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            leadingIcon="sort-calendar-ascending"
            title="Sort Ascending"
            onPress={() => {
              setSortDirection("asc");
              setSortMenuVisible(false);
            }}
          />
          <Menu.Item
            leadingIcon="sort-calendar-descending"
            title="Sort Descending"
            onPress={() => {
              setSortDirection("desc");
              setSortMenuVisible(false);
            }}
          />
        </Menu>
      </View>

      {eventLoading && !serverEvents ? (
        <List.Item
          title="Loading events..."
          left={(props) => <List.Icon {...props} icon="loading" />}
        />
      ) : fetchError ? (
        <Text style={styles.errorText}>
          Failed to load events. Pull down to refresh.
        </Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => renderRightActions(item.id)}
              enabled={!isPending(item.id)}
            >
              <TouchableOpacity
                onPress={() => {
                  if (!isPending(item.id)) {
                    router.push({
                      pathname: "/event-details",
                      params: {
                        event: JSON.stringify(item),
                      },
                    });
                  }
                }}
              >
                <List.Item
                  title={item.title}
                  description={moment(new Date(item.eventTime)).calendar()}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={
                        optimisticUpdates.deletes.includes(item.id)
                          ? "delete-clock"
                          : "calendar"
                      }
                      color={
                        isPending(item.id)
                          ? colors.onSurfaceDisabled
                          : colors.primary
                      }
                    />
                  )}
                  style={[
                    styles.listItem,
                    isPending(item.id) && styles.pendingItem,
                  ]}
                  titleStyle={{
                    color: colors.onSurface,
                    fontStyle: optimisticUpdates.adds.some(
                      (e) => e.id === item.id
                    )
                      ? "italic"
                      : "normal",
                  }}
                  descriptionStyle={{ color: colors.onSurfaceVariant }}
                />
              </TouchableOpacity>
            </Swipeable>
          )}
          ListEmptyComponent={
            <List.Item
              title={`No ${
                eventFilter === "upcoming" ? "upcoming" : ""
              } events`}
              description="Tap the + button to add one"
              left={(props) => <List.Icon {...props} icon="calendar-blank" />}
            />
          }
          onEndReached={loadMoreEvents}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      <IconButton
        icon="plus"
        iconColor={colors.onPrimary}
        size={30}
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
        disabled={eventLoading}
      />

      <AddEventModal
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddEvent}
      />
    </View>
  );
}
