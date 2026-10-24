import jwt from "jsonwebtoken";
import { AuthService } from "./authService";
import { NewUser, UserRecord, UserRepository } from "../repositories/userRepository";

/** In-memory stand-in for the database, used only in tests. */
class FakeUserRepository implements UserRepository {
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

const SECRET = "test-secret";
const valid = { name: "Asha", email: "asha@example.com", password: "password123" };

let repo: FakeUserRepository;
let service: AuthService;

beforeEach(() => {
  repo = new FakeUserRepository();
  service = new AuthService(repo, SECRET);
});

describe("AuthService.register", () => {
  it("creates a USER with a hashed password and hides the hash", async () => {
    const user = await service.register(valid);

    expect(user).toMatchObject({ name: "Asha", email: "asha@example.com", role: "USER" });
    expect(user).not.toHaveProperty("passwordHash");
    expect(repo.users[0].passwordHash).not.toBe("password123");
  });

  it("normalises the email to lower case", async () => {
    const user = await service.register({ ...valid, email: "  ASHA@Example.com " });
    expect(user.email).toBe("asha@example.com");
  });

  it("rejects a duplicate email with 409", async () => {
    await service.register(valid);
    await expect(service.register(valid)).rejects.toMatchObject({ status: 409 });
  });

  it.each([
    [{ ...valid, name: "" }, "name"],
    [{ ...valid, email: "not-an-email" }, "email"],
    [{ ...valid, password: "short" }, "password"],
  ])("rejects invalid input %#", async (input, field) => {
    await expect(service.register(input)).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining(field),
    });
  });
});

describe("AuthService.login", () => {
  it("returns a signed JWT carrying the user id and role", async () => {
    await service.register(valid);

    const { token, user } = await service.login({ email: valid.email, password: valid.password });
    const payload = jwt.verify(token, SECRET) as jwt.JwtPayload;

    expect(payload.sub).toBe(String(user.id));
    expect(payload.role).toBe("USER");
  });

  it("rejects a wrong password with 401", async () => {
    await service.register(valid);
    await expect(service.login({ email: valid.email, password: "wrong-password" })).rejects.toMatchObject({ status: 401 });
  });

  it("rejects an unknown email with 401", async () => {
    await expect(service.login({ email: "nobody@example.com", password: "password123" })).rejects.toMatchObject({ status: 401 });
  });
});