import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma";

async function main() {
  const [email, password, name = "Admin"] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: npm run create-admin -- <email> <password> [name]");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const normalised = email.trim().toLowerCase();
  const user = await prisma.user.upsert({
    where: { email: normalised },
    update: { role: "ADMIN", passwordHash },
    create: { email: normalised, name, passwordHash, role: "ADMIN" },
  });
  console.log(`Admin ready: ${user.email}`);
}

main().finally(() => prisma.$disconnect());