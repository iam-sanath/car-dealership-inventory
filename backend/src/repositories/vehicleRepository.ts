import { VehicleInput } from "../validators/vehicle";

export interface VehicleRecord extends VehicleInput {
  id: number;
}

export interface VehicleFilter {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

/** What the service needs from storage. The real one uses Prisma; tests use a fake. */
export interface VehicleRepository {
  create(data: VehicleInput): Promise<VehicleRecord>;
  findById(id: number): Promise<VehicleRecord | null>;
  findMany(filter: VehicleFilter, skip: number, take: number): Promise<{ items: VehicleRecord[]; total: number }>;
  update(id: number, data: VehicleInput): Promise<VehicleRecord | null>;
  delete(id: number): Promise<boolean>;
  /** Atomically subtracts stock. Returns null if the vehicle is missing or has too little stock. */
  decrementStock(id: number, amount: number): Promise<VehicleRecord | null>;
  incrementStock(id: number, amount: number): Promise<VehicleRecord | null>;
}