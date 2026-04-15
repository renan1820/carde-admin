export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  year: number;
  category: string;
  shortDescription: string;
  fullHistory: string;
  imageUrls: string[];
  engineSoundUrl?: string;
  specs: Record<string, string>;
  qrCodeImageUrl?: string | null;
}

export interface VehicleQrCode {
  id: string;
  vehicleId: string;
  qrValue: string;
  imageUrl: string;
}

export interface MuseumEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  isFeatured: boolean;
}

export type VehicleCategory = 'car' | 'motorcycle' | 'truck' | 'bus' | 'racing' | 'classic';

export interface LoginResponse {
  token: string;
  email: string;
}

export interface VehicleRequest {
  name: string;
  brand: string;
  year: number;
  category: VehicleCategory;
  shortDescription: string;
  fullHistory: string;
  imageUrls: string[];
  engineSoundUrl?: string;
  specs: { key: string; value: string; sortOrder: number }[];
}

export interface EventRequest {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  featured: boolean;
}
