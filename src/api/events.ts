import { client } from './client';
import type { MuseumEvent, EventRequest } from '../types';

export async function listEvents(): Promise<MuseumEvent[]> {
  const { data } = await client.get<MuseumEvent[]>('/admin/events');
  return data;
}

export async function createEvent(req: EventRequest): Promise<MuseumEvent> {
  const { data } = await client.post<MuseumEvent>('/admin/events', req);
  return data;
}

export async function updateEvent(id: string, req: EventRequest): Promise<MuseumEvent> {
  const { data } = await client.put<MuseumEvent>(`/admin/events/${id}`, req);
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  await client.delete(`/admin/events/${id}`);
}
