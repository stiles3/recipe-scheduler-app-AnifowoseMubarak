export type EventResponse = {
  eventTime: string;
  createdAt: string;
  id: string;
  title: string;
  userId: string;
  reminderMinutes: number;
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
