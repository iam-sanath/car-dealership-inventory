import { validateVehicle } from "./vehicle";

const valid = { make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 };

describe("validateVehicle", () => {
  it("accepts a valid vehicle", () => {
    expect(() => validateVehicle(valid)).not.toThrow();
  });

  it.each(["make", "model", "category"])("rejects missing %s", (field) => {
    expect(() => validateVehicle({ ...valid, [field]: undefined })).toThrow(field);
  });

  it.each(["make", "model", "category"])("rejects blank %s", (field) => {
    expect(() => validateVehicle({ ...valid, [field]: "   " })).toThrow(field);
  });

  it.each([0, -5, NaN, "100"])("rejects invalid price %p", (price) => {
    expect(() => validateVehicle({ ...valid, price })).toThrow("price");
  });

  it.each([-1, 2.5, "3"])("rejects invalid quantity %p", (quantity) => {
    expect(() => validateVehicle({ ...valid, quantity })).toThrow("quantity");
  });

  it("allows zero quantity (out of stock is valid)", () => {
    expect(() => validateVehicle({ ...valid, quantity: 0 })).not.toThrow();
  });
});