export type EventResponse = {

    eventTime: string;
    createdAt: string;
    id: string;
    title: string;
    userId: string;
    reminderMinutes: number;
  

};
export type EventResponseData = {
  data: EventResponse[]
  meta: {
    limit: number;
    hasMore: boolean;
    lastEvaluatedKey: Record<string, string>;
    page: number;
  };
};

export type AddEventRequest = {
  userId: string;
  title: string;
  eventTime: string;
};

export type UpdateEventRequest = {
  payload: { title?: string; eventTime?: string };
  eventId: string;
};

export type SetDeviceTokenRequest = {
  userId: string;
  token: string;
};
