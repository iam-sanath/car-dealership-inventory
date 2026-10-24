import { VehicleService } from "./vehicleService";
import { FakeVehicleRepository } from "../testing/fakeVehicleRepository";

const camry = { make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 };
const civic = { make: "Honda", model: "Civic", category: "Sedan", price: 22000, quantity: 3 };
const f150 = { make: "Ford", model: "F-150", category: "Truck", price: 45000, quantity: 0 };

let service: VehicleService;

beforeEach(() => {
  service = new VehicleService(new FakeVehicleRepository());
});

async function seedAll() {
  await service.create(camry);
  await service.create(civic);
  await service.create(f150);
}

describe("VehicleService.create", () => {
  it("stores a valid vehicle and returns it with an id", async () => {
    const created = await service.create(camry);
    expect(created).toMatchObject({ id: 1, ...camry });
  });

  it("rejects invalid input with 400", async () => {
    await expect(service.create({ ...camry, price: -1 })).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining("price"),
    });
  });
});

describe("VehicleService.list", () => {
  beforeEach(seedAll);

  it("returns the first page with pagination metadata", async () => {
    const result = await service.list({ limit: 2 });

    expect(result.data).toHaveLength(2);
    expect(result).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });

  it("returns later pages", async () => {
    const result = await service.list({ page: 2, limit: 2 });
    expect(result.data).toHaveLength(1);
    expect(result.page).toBe(2);
  });

  it("uses defaults when no query is given", async () => {
    const result = await service.list();
    expect(result).toMatchObject({ page: 1, limit: 12, total: 3 });
  });

  it("caps the page size at 50", async () => {
    expect((await service.list({ limit: 1000 })).limit).toBe(50);
  });

  it.each(["0", "abc", "-1"])("rejects invalid page %p with 400", async (page) => {
    await expect(service.list({ page })).rejects.toMatchObject({ status: 400 });
  });

  it("filters by make (partial, case-insensitive)", async () => {
    const result = await service.list({ make: "toy" });
    expect(result.data.map((v) => v.model)).toEqual(["Camry"]);
  });

  it("filters by model", async () => {
    const result = await service.list({ model: "civ" });
    expect(result.data.map((v) => v.model)).toEqual(["Civic"]);
  });

  it("filters by category", async () => {
    expect((await service.list({ category: "sedan" })).total).toBe(2);
  });

  it("filters by price range", async () => {
    expect((await service.list({ minPrice: "23000", maxPrice: "30000" })).data.map((v) => v.model)).toEqual(["Camry"]);
    expect((await service.list({ minPrice: "30000" })).data.map((v) => v.model)).toEqual(["F-150"]);
  });

  it("rejects a minimum price above the maximum", async () => {
    await expect(service.list({ minPrice: "50000", maxPrice: "100" })).rejects.toMatchObject({ status: 400 });
  });

  it("paginates filtered results using the filtered total", async () => {
    const result = await service.list({ category: "Sedan", limit: 1 });
    expect(result).toMatchObject({ total: 2, totalPages: 2 });
    expect(result.data).toHaveLength(1);
  });
});

describe("VehicleService.update", () => {
  it("replaces the vehicle's details", async () => {
    const created = await service.create(camry);
    const updated = await service.update(created.id, { ...camry, price: 24000 });
    expect(updated.price).toBe(24000);
  });

  it("returns 404 for an unknown vehicle", async () => {
    await expect(service.update(99, camry)).rejects.toMatchObject({ status: 404 });
  });

  it("rejects invalid input with 400", async () => {
    const created = await service.create(camry);
    await expect(service.update(created.id, { ...camry, make: "" })).rejects.toMatchObject({ status: 400 });
  });
});

describe("VehicleService.delete", () => {
  it("removes the vehicle", async () => {
    const created = await service.create(camry);
    await service.delete(created.id);
    expect((await service.list()).total).toBe(0);
  });

  it("returns 404 for an unknown vehicle", async () => {
    await expect(service.delete(99)).rejects.toMatchObject({ status: 404 });
  });
});

describe("VehicleService.purchase", () => {
  beforeEach(seedAll);

  it("decreases stock by one by default", async () => {
    expect((await service.purchase(1)).quantity).toBe(4);
  });

  it("decreases stock by the requested amount", async () => {
    expect((await service.purchase(1, 2)).quantity).toBe(3);
  });

  it("returns 409 when the vehicle is out of stock", async () => {
    await expect(service.purchase(3)).rejects.toMatchObject({ status: 409 });
  });

  it("returns 409 when asking for more than is in stock", async () => {
    await expect(service.purchase(2, 10)).rejects.toMatchObject({ status: 409 });
  });

  it("returns 404 for an unknown vehicle", async () => {
    await expect(service.purchase(99)).rejects.toMatchObject({ status: 404 });
  });

  it.each([0, 1.5, "x"])("rejects invalid quantity %p with 400", async (quantity) => {
    await expect(service.purchase(1, quantity)).rejects.toMatchObject({ status: 400 });
  });
});

describe("VehicleService.restock", () => {
  beforeEach(seedAll);

  it("increases stock", async () => {
    expect((await service.restock(3, 10)).quantity).toBe(10);
  });

  it("returns 404 for an unknown vehicle", async () => {
    await expect(service.restock(99, 5)).rejects.toMatchObject({ status: 404 });
  });

  it.each([undefined, 0, -3, 1.5])("rejects invalid quantity %p with 400", async (quantity) => {
    await expect(service.restock(1, quantity)).rejects.toMatchObject({ status: 400 });
  });
});