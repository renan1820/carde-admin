import { client } from './client';

export interface ReorderItem {
  id: string;
  displayOrder: number;
}

export async function reorderEvents(items: ReorderItem[]): Promise<void> {
  await client.patch('/admin/events/reorder', items);
}

export async function reorderVehicles(items: ReorderItem[]): Promise<void> {
  await client.patch('/admin/vehicles/reorder', items);
}
