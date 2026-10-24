import { NewUser, UserRecord, UserRepository } from "../repositories/userRepository";

/** In-memory stand-in for the database, used only in tests. */
export class FakeUserRepository implements UserRepository {
  users: UserRecord[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async create(data: NewUser) {
    const user: UserRecord = { id: this.users.length + 1, role: "USER", ...data };
    this.users.push(user);
    return user;
  }
}