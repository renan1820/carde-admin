import { client } from './client';
import type { Vehicle, VehicleRequest } from '../types';

export async function listVehicles(): Promise<Vehicle[]> {
  const { data } = await client.get<Vehicle[]>('/admin/vehicles');
  return data;
}

export async function createVehicle(req: VehicleRequest): Promise<Vehicle> {
  const { data } = await client.post<Vehicle>('/admin/vehicles', req);
  return data;
}

export async function updateVehicle(id: string, req: VehicleRequest): Promise<Vehicle> {
  const { data } = await client.put<Vehicle>(`/admin/vehicles/${id}`, req);
  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await client.delete(`/admin/vehicles/${id}`);
}
