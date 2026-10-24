export function validateVehicle(input: Record<string, unknown>): void {
  for (const field of ["make", "model", "category"]) {
    const value = input[field];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`${field} is required`);
    }
  }

  const price = input.price;
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    throw new Error("price must be a positive number");
  }

  const quantity = input.quantity;
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0) {
    throw new Error("quantity must be a non-negative integer");
  }
}