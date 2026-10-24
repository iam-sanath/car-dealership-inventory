export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export type VehicleInput = Omit<Vehicle, "id">;

/** Shape of every paginated list response from the API. */
export interface Page<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VehicleFilters {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

export const EMPTY_FILTERS: VehicleFilters = { make: "", model: "", category: "", minPrice: "", maxPrice: "" };

export const CATEGORIES = ["Sedan", "SUV", "Hatchback", "Truck", "Electric"] as const;