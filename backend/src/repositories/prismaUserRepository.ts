import { prisma } from "../db/prisma";
import { NewUser, UserRepository } from "./userRepository";

export class PrismaUserRepository implements UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  create(data: NewUser) {
    return prisma.user.create({ data });
  }
}