import "dotenv/config";
import { prisma } from "../db/prisma";

const vehicles = [
  { make: "Toyota", model: "Camry Hybrid", category: "Sedan", price: 4599000, quantity: 6 },
  { make: "Hyundai", model: "Creta SX", category: "SUV", price: 1899000, quantity: 12 },
  { make: "Tata", model: "Nexon EV", category: "Electric", price: 1749000, quantity: 4 },
  { make: "Mahindra", model: "Thar LX", category: "SUV", price: 1699000, quantity: 2 },
  { make: "Honda", model: "City ZX", category: "Sedan", price: 1429000, quantity: 0 },
  { make: "Maruti Suzuki", model: "Swift ZXi", category: "Hatchback", price: 899000, quantity: 9 },
  { make: "Toyota", model: "Hilux", category: "Truck", price: 3599000, quantity: 3 },
  { make: "Hyundai", model: "Verna SX", category: "Sedan", price: 1349000, quantity: 7 },
  { make: "Tata", model: "Tiago EV", category: "Electric", price: 1099000, quantity: 5 },
  { make: "Kia", model: "Seltos HTX", category: "SUV", price: 1799000, quantity: 8 },
  { make: "Maruti Suzuki", model: "Baleno Alpha", category: "Hatchback", price: 999000, quantity: 10 },
  { make: "Isuzu", model: "D-Max V-Cross", category: "Truck", price: 2699000, quantity: 1 },
];

async function main() {
  const existing = await prisma.vehicle.count();
  if (existing > 0) {
    console.log(`Skipped: ${existing} vehicles already exist.`);
    return;
  }
  await prisma.vehicle.createMany({ data: vehicles });
  console.log(`Inserted ${vehicles.length} vehicles.`);
}

main().finally(() => prisma.$disconnect());