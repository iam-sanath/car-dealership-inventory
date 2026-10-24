export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function requirePositiveNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a positive number`);
  }
  return value;
}

function requireNonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }
  return value;
}

/** Validates untrusted input and returns a clean, typed vehicle. Throws on the first problem. */
export function validateVehicle(input: Record<string, unknown>): VehicleInput {
  return {
    make: requireText(input.make, "make"),
    model: requireText(input.model, "model"),
    category: requireText(input.category, "category"),
    price: requirePositiveNumber(input.price, "price"),
    quantity: requireNonNegativeInteger(input.quantity, "quantity"),
  };
}