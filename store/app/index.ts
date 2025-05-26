import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth, createBaseQuery } from "../configure";
import {
  AddEventRequest,
  EventResponse,
  SetDeviceTokenRequest,
  UpdateEventRequest,
} from "@/types";

const authBaseQuery = createBaseQuery("http://192.168.100.24:3000");
export const appApi = createApi({
  reducerPath: "appApi",
  baseQuery: baseQueryWithReauth(authBaseQuery),
  endpoints: (builder) => ({
    setUserToken: builder.mutation<void, SetDeviceTokenRequest>({
      query: (payload) => {
        return {
          url: "/api/devices",
          method: "POST",
          body: payload,
        };
      },
      transformResponse: (response) => {
        return response;
      },
    }),
    addEvent: builder.mutation<EventResponse, AddEventRequest>({
      query: (payload) => {
        return {
          url: "/api/events",
          method: "POST",
          body: payload,
        };
      },
      transformResponse: (response: any) => {
        return response;
      },
    }),
    updateEvent: builder.mutation<EventResponse, UpdateEventRequest>({
      query: ({ payload, eventId }) => {
        return {
          url: `/api/events/${eventId}`,
          method: "PATCH",
          body: payload,
        };
      },
      transformResponse: (response: any) => {
        return response;
      },
    }),
    deleteEvent: builder.mutation<void, string>({
      query: (eventId) => {
        return {
          url: `/api/events/${eventId}`,
          method: "DELETE",
        };
      },
      transformResponse: (response: any) => {
        return response;
      },
    }),
    getUpcomingEvents: builder.query<
      EventResponse[],
      { userId: string; upcoming: string }
    >({
      query: ({ userId, upcoming }) => {
        return {
          url: `/api/events?userId=${userId}&upcomingOnly=${upcoming}`,
        };
      },
      transformResponse: (response: any) => {
        return response;
      },
    }),
  }),
});

export const {
  useAddEventMutation,
  useDeleteEventMutation,
  useGetUpcomingEventsQuery,
  useSetUserTokenMutation,
  useUpdateEventMutation,
} = appApi;
