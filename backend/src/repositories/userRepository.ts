export type Role = "USER" | "ADMIN";

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

/** What the service needs from storage. The real one uses Prisma; tests use a fake. */
export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: NewUser): Promise<UserRecord>;
}