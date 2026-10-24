import { VehicleInput } from "../validators/vehicle";
import { VehicleFilter, VehicleRecord, VehicleRepository } from "../repositories/vehicleRepository";

function matches(v: VehicleRecord, f: VehicleFilter): boolean {
  const has = (text: string, part: string) => text.toLowerCase().includes(part.toLowerCase());
  return (
    (!f.make || has(v.make, f.make)) &&
    (!f.model || has(v.model, f.model)) &&
    (!f.category || v.category.toLowerCase() === f.category.toLowerCase()) &&
    (f.minPrice === undefined || v.price >= f.minPrice) &&
    (f.maxPrice === undefined || v.price <= f.maxPrice)
  );
}

/** In-memory stand-in for the database, used only in tests. */
export class FakeVehicleRepository implements VehicleRepository {
  vehicles: VehicleRecord[] = [];
  private nextId = 1;

  async create(data: VehicleInput) {
    const vehicle = { id: this.nextId++, ...data };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  async findById(id: number) {
    return this.vehicles.find((v) => v.id === id) ?? null;
  }

  async findMany(filter: VehicleFilter, skip: number, take: number) {
    const found = this.vehicles.filter((v) => matches(v, filter));
    return { items: found.slice(skip, skip + take), total: found.length };
  }

  async update(id: number, data: VehicleInput) {
    const index = this.vehicles.findIndex((v) => v.id === id);
    if (index < 0) return null;
    this.vehicles[index] = { id, ...data };
    return this.vehicles[index];
  }

  async delete(id: number) {
    const before = this.vehicles.length;
    this.vehicles = this.vehicles.filter((v) => v.id !== id);
    return this.vehicles.length < before;
  }

  async decrementStock(id: number, amount: number) {
    const vehicle = this.vehicles.find((v) => v.id === id);
    if (!vehicle || vehicle.quantity < amount) return null;
    vehicle.quantity -= amount;
    return vehicle;
  }

  async incrementStock(id: number, amount: number) {
    const vehicle = this.vehicles.find((v) => v.id === id);
    if (!vehicle) return null;
    vehicle.quantity += amount;
    return vehicle;
  }
}