import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { VehicleInput } from "../validators/vehicle";
import { VehicleFilter, VehicleRepository } from "./vehicleRepository";

/** Prisma's "record not found" error code. */
function isNotFound(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

export class PrismaVehicleRepository implements VehicleRepository {
  create(data: VehicleInput) {
    return prisma.vehicle.create({ data });
  }

  findById(id: number) {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  async findMany(filter: VehicleFilter, skip: number, take: number) {
    const where: Prisma.VehicleWhereInput = {
      make: filter.make ? { contains: filter.make, mode: "insensitive" } : undefined,
      model: filter.model ? { contains: filter.model, mode: "insensitive" } : undefined,
      category: filter.category ? { equals: filter.category, mode: "insensitive" } : undefined,
      price: { gte: filter.minPrice, lte: filter.maxPrice },
    };
    const [items, total] = await prisma.$transaction([
      prisma.vehicle.findMany({ where, skip, take, orderBy: { id: "asc" } }),
      prisma.vehicle.count({ where }),
    ]);
    return { items, total };
  }

  async update(id: number, data: VehicleInput) {
    try {
      return await prisma.vehicle.update({ where: { id }, data });
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
  }

  async delete(id: number) {
    try {
      await prisma.vehicle.delete({ where: { id } });
      return true;
    } catch (err) {
      if (isNotFound(err)) return false;
      throw err;
    }
  }

  async decrementStock(id: number, amount: number) {
    // One statement checks the stock AND subtracts, so it cannot go negative under concurrent buyers.
    const { count } = await prisma.vehicle.updateMany({
      where: { id, quantity: { gte: amount } },
      data: { quantity: { decrement: amount } },
    });
    return count === 1 ? this.findById(id) : null;
  }

  async incrementStock(id: number, amount: number) {
    try {
      return await prisma.vehicle.update({ where: { id }, data: { quantity: { increment: amount } } });
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
  }
}