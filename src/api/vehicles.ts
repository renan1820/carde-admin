import { client } from './client';
import type { Vehicle, VehicleQrCode, VehicleRequest } from '../types';

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

export async function getVehicleQrCode(vehicleId: string): Promise<VehicleQrCode | null> {
  try {
    const { data } = await client.get<VehicleQrCode>(`/admin/vehicles/${vehicleId}/qr-code`);
    return data;
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
    throw err;
  }
}

export async function generateVehicleQrCode(vehicleId: string): Promise<VehicleQrCode> {
  const { data } = await client.post<VehicleQrCode>(`/admin/vehicles/${vehicleId}/qr-code`);
  return data;
}
