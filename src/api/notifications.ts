import { client } from './client';

export interface NotificationPayload {
  title: string;
  body: string;
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  sentBy: string;
}

export async function sendNotification(payload: NotificationPayload): Promise<NotificationLog> {
  const res = await client.post<NotificationLog>('/admin/notifications', payload);
  return res.data;
}

export async function getNotificationLogs(): Promise<NotificationLog[]> {
  const res = await client.get<NotificationLog[]>('/admin/notifications');
  return res.data;
}
