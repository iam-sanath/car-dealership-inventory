import { HttpError } from "../errors";
import { VehicleFilter, VehicleRecord, VehicleRepository } from "../repositories/vehicleRepository";
import { validateVehicle, VehicleInput } from "../validators/vehicle";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

/** Query-string values arrive as untrusted strings, hence `unknown`. */
export interface VehicleQuery {
  page?: unknown;
  limit?: unknown;
  make?: unknown;
  model?: unknown;
  category?: unknown;
  minPrice?: unknown;
  maxPrice?: unknown;
}

export interface Page<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function optionalPrice(value: unknown, field: string): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new HttpError(400, `${field} must be a non-negative number`);
  return n;
}

function positiveInteger(value: unknown, fallback: number, field: string): number {
  if (value === undefined || value === "") return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, `${field} must be a positive integer`);
  return n;
}

export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}

  async create(input: Record<string, unknown>): Promise<VehicleRecord> {
    return this.vehicles.create(this.parse(input));
  }

  /** Lists vehicles with optional filters. Used for both /vehicles and /vehicles/search. */
  async list(query: VehicleQuery = {}): Promise<Page<VehicleRecord>> {
    const page = positiveInteger(query.page, 1, "page");
    const limit = Math.min(positiveInteger(query.limit, DEFAULT_LIMIT, "limit"), MAX_LIMIT);
    const filter: VehicleFilter = {
      make: optionalText(query.make),
      model: optionalText(query.model),
      category: optionalText(query.category),
      minPrice: optionalPrice(query.minPrice, "minPrice"),
      maxPrice: optionalPrice(query.maxPrice, "maxPrice"),
    };
    if (filter.minPrice !== undefined && filter.maxPrice !== undefined && filter.minPrice > filter.maxPrice) {
      throw new HttpError(400, "minPrice cannot be greater than maxPrice");
    }

    const { items, total } = await this.vehicles.findMany(filter, (page - 1) * limit, limit);
    return { data: items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async update(id: number, input: Record<string, unknown>): Promise<VehicleRecord> {
    const updated = await this.vehicles.update(id, this.parse(input));
    if (!updated) throw new HttpError(404, "vehicle not found");
    return updated;
  }

  async delete(id: number): Promise<void> {
    if (!(await this.vehicles.delete(id))) throw new HttpError(404, "vehicle not found");
  }

  private parse(input: Record<string, unknown>): VehicleInput {
    try {
      return validateVehicle(input);
    } catch (err) {
      throw new HttpError(400, err instanceof Error ? err.message : "invalid vehicle");
    }
  }
}

